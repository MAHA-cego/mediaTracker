# media-tracker

Media tracking web app for books, manga, movies, anime, games, and more — with social features (friends, groups).

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19
- **Language:** TypeScript 5
- **Database:** PostgreSQL 16 (Prisma 7 ORM, pg adapter)
- **Auth:** Custom JWT (bcrypt + jsonwebtoken)
- **Styling:** Tailwind CSS 4
- **Cache + Queue:** Redis 7 (ioredis) + BullMQ for background jobs
- **Worker:** Separate Node.js process (tsx runner)

## Dev Setup

```bash
docker compose up -d   # start Postgres + Redis
npm run dev            # dev server in terminal 1 (uses --webpack, NOT Turbopack)
npm run worker:dev     # worker process in terminal 2 (tsx watch mode)
```

Required environment variables (`.env`):

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/media_tracker"
JWT_SECRET=<64-char hex>
JWT_REFRESH_SECRET=<64-char hex>
REDIS_URL="redis://localhost:6379"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

Prisma client is generated at `src/generated/prisma/` (git-ignored). Run `npx prisma generate` after schema changes and `npx prisma migrate dev` for migrations.

Path alias: `@/*` → `src/*`

## Architecture

```
src/
├── app/
│   ├── (auth)/          # Login page (unauthenticated layout)
│   ├── (app)/           # Protected pages (redirects to /login if no session)
│   └── api/             # REST API route handlers
├── components/          # React components (friends/, groups/, media/, layout/)
├── context/             # ScopeContext — personal vs. group scope
├── hooks/               # useSession
├── lib/
│   ├── auth.ts          # JWT sign/verify
│   ├── prisma.ts        # Prisma singleton with pg connection pool
│   ├── api-client.ts    # Client-side fetch wrapper (credentials: include)
│   ├── api-server.ts    # Server-side fetch wrapper (forwards cookies)
│   ├── redis.ts         # ioredis singleton (shared by cache, rate-limit, queue)
│   ├── cache.ts         # get/set/del with TTL + version-counter helpers
│   ├── rate-limit.ts    # Sliding-window rate limiter
│   └── queue.ts         # BullMQ Queue + typed JobPayload + enqueue()
├── workers/
│   ├── index.ts         # BullMQ Worker process entry point
│   └── handlers/
│       ├── friendship.ts # FRIEND_REQUEST_SENT, FRIEND_ACCEPTED
│       ├── media.ts      # MEDIA_ENTRY_*
│       └── group.ts      # GROUP_*
├── proxy.ts             # Next.js middleware — JWT auth guard
└── types/               # media.ts, scope.ts
```

### Auth Flow

`src/proxy.ts` is the Next.js middleware. It:

1. Reads the `token` HTTP-only cookie
2. Verifies the JWT signature with `JWT_SECRET`
3. Injects the `x-user-id` header into the request
4. Applies to: `/api/me`, `/api/media-entry/:path*`, `/api/friends/:path*`, `/api/groups/:path*`

API handlers read `x-user-id` directly from headers — no session lookup needed.

### Scope System

The UI uses `ScopeContext` to track whether the user is in **personal** or **group** scope. This drives which API endpoints are called and what data is shown.

| Scope    | Description                                            |
| -------- | ------------------------------------------------------ |
| Personal | User's own media entries; full ownership               |
| Group    | Shared entries within a group; governed by `GroupRole` |

Group roles are enforced in API handlers (not middleware):

| Role   | Permissions                                                  |
| ------ | ------------------------------------------------------------ |
| OWNER  | Delete group, add members (friends only), transfer ownership |
| MEMBER | View group, add/update group media entries, leave group      |

Additional rules:

- Only friends can be added as group members
- The last owner cannot leave without first transferring ownership
- Personal `MediaEntry` access is validated by `entry.userId === x-user-id`

## Backend Infrastructure

### Caching (Redis)

All GET endpoints read from cache first (1–5 min TTL), fall through to DB on cache miss, and write result back. Cache keys:

| Endpoint                                 | Key                                                            | TTL   |
| ---------------------------------------- | -------------------------------------------------------------- | ----- |
| `GET /api/me`                            | `user:{userId}:profile`                                        | 5 min |
| `GET /api/friends`                       | `user:{userId}:friends`                                        | 2 min |
| `GET /api/friends/requests`              | `user:{userId}:friend-requests`                                | 1 min |
| `GET /api/groups`                        | `user:{userId}:groups`                                         | 2 min |
| `GET /api/groups/[id]`                   | `group:{groupId}:details`                                      | 2 min |
| `GET /api/media-entry` (paginated)       | Versioned: `user:{userId}:entries:v{n}:{page}:{status}:{sort}` | 1 min |
| `GET /api/groups/[id]/media` (paginated) | Versioned: `group:{groupId}:media:v{n}:{page}:{status}:{sort}` | 1 min |

**Versioned keys:** Paginated endpoints use a version counter (`{namespace}:version`) that's incremented on any write. This avoids expensive pattern-based invalidation (`SCAN`); old cached pages naturally expire via TTL.

### Rate Limiting (Redis)

Sliding-window counters prevent abuse:

| Route                       | Limit       | Window          |
| --------------------------- | ----------- | --------------- |
| `POST /api/login`           | 10 requests | 15 min per IP   |
| `POST /api/friends/request` | 20 requests | 1 hour per user |

Returns 429 with `Retry-After` header if exceeded.

### Background Jobs (BullMQ + Redis)

Every write route enqueues a typed job after successful DB write + cache invalidation. Jobs are processed asynchronously by the worker with retry logic (3 attempts, exponential backoff).

Job types:

- `FRIEND_REQUEST_SENT` — future: notify receiver
- `FRIEND_ACCEPTED` — future: notify both users
- `MEDIA_ENTRY_CREATED/UPDATED/DELETED` — future: recompute user stats
- `GROUP_CREATED/MEMBER_ADDED/MEMBER_LEFT/MEDIA_ADDED/MEDIA_UPDATED/DELETED` — future: notify group members

**Worker process:** Run `npm run worker:dev` in a separate terminal. The worker reads from the same BullMQ queue and processes jobs concurrently (5 at a time). Gracefully shuts down on SIGTERM/SIGINT.

## Database Models

```
User            id, email (unique), username (unique), passwordHash, createdAt
Media           id, title, type (MediaType), createdAt
MediaEntry      id, userId, mediaId, status, rating?, progress?, startedAt?, completedAt?
                  unique(userId, mediaId)
FriendRequest   id, requesterId, receiverId, createdAt
                  unique(requesterId, receiverId)
Friendship      id, userAId, userBId, createdAt
                  unique(userAId, userBId)
Group           id, name, createdById, createdAt
                  unique(createdById, name)
GroupMember     PK(groupId, userId), role (GroupRole), joinedAt
GroupMediaEntry id, groupId, mediaId, status, rating?, progress?, startedAt?, completedAt?, addedById
                  unique(groupId, mediaId)
```

**MediaType:** `BOOK | LIGHT_NOVEL | MANGA | MANWHA | MANHUA | COMIC | MOVIE | SERIES | ANIME | VIDEO_GAME | OTHER`

**MediaStatus:** `PLANNED | IN_PROGRESS | COMPLETED | DROPPED`

**GroupRole:** `OWNER | MEMBER`

## API Routes

### Auth / Users

| Method | Path         | Auth | Description                                    |
| ------ | ------------ | ---- | ---------------------------------------------- |
| POST   | `/api/users` | No   | Register new user                              |
| GET    | `/api/users` | No   | List all users                                 |
| POST   | `/api/login` | No   | Login — sets `token` JWT cookie (7-day expiry) |
| GET    | `/api/me`    | Yes  | Current user profile                           |

### Media Catalog

| Method | Path                 | Auth | Description                                   |
| ------ | -------------------- | ---- | --------------------------------------------- |
| POST   | `/api/media`         | No   | Create a media item                           |
| GET    | `/api/media?search=` | No   | Search by title (min 2 chars, returns top 10) |

### Personal Media Entries

| Method | Path                    | Auth        | Description                                               |
| ------ | ----------------------- | ----------- | --------------------------------------------------------- |
| POST   | `/api/media-entry`      | Yes         | Create entry                                              |
| GET    | `/api/media-entry`      | Yes         | List entries (paginated; `?status=`, `?sort=rating_desc`) |
| GET    | `/api/media-entry/[id]` | Yes (owner) | Get entry                                                 |
| PATCH  | `/api/media-entry/[id]` | Yes (owner) | Update status / rating / progress                         |
| DELETE | `/api/media-entry/[id]` | Yes (owner) | Delete entry                                              |

### Friends

| Method | Path                    | Auth | Description                     |
| ------ | ----------------------- | ---- | ------------------------------- |
| GET    | `/api/friends`          | Yes  | List current friends            |
| POST   | `/api/friends/request`  | Yes  | Send friend request by username |
| GET    | `/api/friends/requests` | Yes  | List pending incoming requests  |
| POST   | `/api/friends/accept`   | Yes  | Accept a request by `requestId` |

### Groups

| Method | Path                                  | Auth         | Description                                        |
| ------ | ------------------------------------- | ------------ | -------------------------------------------------- |
| POST   | `/api/groups`                         | Yes          | Create group (creator auto-added as OWNER)         |
| GET    | `/api/groups`                         | Yes          | List groups the user belongs to                    |
| GET    | `/api/groups/[id]`                    | Yes (member) | Group details + member list                        |
| DELETE | `/api/groups/[id]`                    | Yes (OWNER)  | Delete group                                       |
| POST   | `/api/groups/[id]/members`            | Yes (OWNER)  | Add a friend as MEMBER                             |
| POST   | `/api/groups/[id]/leave`              | Yes (member) | Leave the group                                    |
| POST   | `/api/groups/[id]/transfer-ownership` | Yes (OWNER)  | Transfer OWNER role to another member              |
| POST   | `/api/groups/[id]/media`              | Yes (member) | Add media to group                                 |
| GET    | `/api/groups/[id]/media`              | Yes (member) | List group media (paginated; `?status=`, `?sort=`) |
| PATCH  | `/api/groups/[id]/media/[mediaId]`    | Yes (member) | Update group media entry                           |

## In Progress

- **GroupInvites** — `src/components/groups/GroupInvites.tsx` exists but the `GroupInvite` Prisma model and API routes (`/api/groups/[id]/invites`) are not yet implemented. Needs schema update + migration before the UI can be wired up.
