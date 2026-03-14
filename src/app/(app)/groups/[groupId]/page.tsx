import { apiServerFetch } from "@/lib/api-server";
import { ScopeProvider } from "@/context/ScopeContext";

import { PaginatedMedia } from "@/types/media";

import Link from "next/link";

import AddGroupMediaForm from "@/components/groups/AddGroupMediaForm";
import AddGroupMember from "@/components/groups/AddGroupMember";
import GroupMembers from "@/components/groups/GroupMembers";
import GroupActions from "@/components/groups/GroupActions";
import TransferOwnership from "@/components/groups/TransferOwnership";

import MediaList from "@/components/media/MediaList";
import MediaFilters from "@/components/media/MediaFilters";

type User = {
  id: string;
  username: string;
};

type Group = {
  id: string;
  name: string;
  role: string;
  members: {
    id: string;
    username: string;
    role: string;
  }[];
};

export default async function GroupPage({
  params,
  searchParams,
}: {
  params: Promise<{ groupId: string }>;
  searchParams: Promise<{
    status?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const { groupId } = await params;
  const filters = await searchParams;

  const page = Number(filters.page ?? 1);

  const query = new URLSearchParams();

  if (filters.status) query.set("status", filters.status);
  if (filters.sort) query.set("sort", filters.sort);
  query.set("page", page.toString());

  const result = await apiServerFetch<PaginatedMedia>(
    `/api/groups/${groupId}/media?${query.toString()}`,
  );

  const friends = await apiServerFetch<User[]>("/api/friends");

  const group = await apiServerFetch<Group>(`/api/groups/${groupId}`);

  const memberIds = new Set(group.members.map((m) => m.id));

  const availableFriends = friends.filter((f) => !memberIds.has(f.id));

  const ownerCount = group.members.filter((m) => m.role === "OWNER").length;

  const isLastOwner = group.role === "OWNER" && ownerCount === 1;

  return (
    <ScopeProvider scope={{ type: "GROUP", groupId }}>
      <div>
        <h1>{group.name}</h1>

        <GroupMembers members={group.members} />

        <TransferOwnership
          groupId={groupId}
          members={group.members}
          role={group.role}
        />

        <AddGroupMember groupId={groupId} friends={availableFriends} />

        <AddGroupMediaForm groupId={groupId} />

        <MediaFilters />

        <MediaList media={result.items} />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginTop: "20px",
          }}
        >
          {page > 1 ? (
            <Link
              href={`/groups/${groupId}?${new URLSearchParams({
                ...filters,
                page: String(page - 1),
              }).toString()}`}
            >
              Previous
            </Link>
          ) : (
            <span style={{ opacity: 0.5 }}>Previous</span>
          )}

          <span>
            Page {result.page} / {result.totalPages}
          </span>

          {page < result.totalPages ? (
            <Link
              href={`/groups/${groupId}?${new URLSearchParams({
                ...filters,
                page: String(page + 1),
              }).toString()}`}
            >
              Next
            </Link>
          ) : (
            <span style={{ opacity: 0.5 }}>Next</span>
          )}
        </div>

        <GroupActions
          groupId={groupId}
          role={group.role}
          isLastOwner={isLastOwner}
        />
      </div>
    </ScopeProvider>
  );
}
