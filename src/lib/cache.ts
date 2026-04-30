import redis from "./redis";

export const CacheKey = {
  userProfile:        (uid: string) => `user:${uid}:profile`,
  userFriends:        (uid: string) => `user:${uid}:friends`,
  userFriendRequests: (uid: string) => `user:${uid}:friend-requests`,
  userGroups:         (uid: string) => `user:${uid}:groups`,
  userEntriesNs:      (uid: string) => `user:${uid}:entries`,
  groupDetails:       (gid: string) => `group:${gid}:details`,
  groupMediaNs:       (gid: string) => `group:${gid}:media`,
};

export async function cacheGet<T>(key: string): Promise<T | null> {
  const value = await redis.get(key);
  if (!value) return null;
  return JSON.parse(value) as T;
}

export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds: number,
): Promise<void> {
  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
}

export async function cacheDel(...keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  await redis.del(...keys);
}

export async function getNamespaceVersion(ns: string): Promise<number> {
  const version = await redis.get(`${ns}:version`);
  return version ? parseInt(version, 10) : 0;
}

export async function bumpNamespaceVersion(ns: string): Promise<void> {
  await redis.incr(`${ns}:version`);
}
