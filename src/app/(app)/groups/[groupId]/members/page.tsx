import { apiServerFetch } from "@/lib/api-server";
import { ScopeProvider } from "@/context/ScopeContext";
import GroupMembers from "@/components/groups/GroupMembers";
import GroupActions from "@/components/groups/GroupActions";
import AddGroupMember from "@/components/groups/AddGroupMember";
import TransferOwnership from "@/components/groups/TransferOwnership";

type User = {
  id: string;
  username: string;
};

type Member = {
  id: string;
  username: string;
  role: string;
};

type Group = {
  id: string;
  name: string;
  role: string;
  members: Member[];
};

export default async function MembersPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;

  const [group, user] = await Promise.all([
    apiServerFetch<Group>(`/api/groups/${groupId}`),
    apiServerFetch<User>("/api/me"),
  ]);

  const ownerCount = group.members.filter((m) => m.role === "OWNER").length;
  const isLastOwner = group.role === "OWNER" && ownerCount === 1;

  let availableFriends: User[] = [];
  if (group.role === "OWNER") {
    const friends = await apiServerFetch<User[]>("/api/friends");
    const memberIds = new Set(group.members.map((m) => m.id));
    availableFriends = friends.filter((f) => !memberIds.has(f.id));
  }

  return (
    <ScopeProvider scope={{ type: "GROUP", groupId }}>
      <div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <h1>Members</h1>
          <GroupActions groupId={groupId} role={group.role} isLastOwner={isLastOwner} />
        </div>

        {group.role === "OWNER" && (
          <div style={{ marginTop: "12px" }}>
            <AddGroupMember groupId={groupId} friends={availableFriends} />
            <TransferOwnership groupId={groupId} members={group.members} role={group.role} />
          </div>
        )}

        <div style={{ marginTop: "16px" }}>
          <GroupMembers
            members={group.members}
            currentUserId={user.id}
            currentUserRole={group.role}
            groupId={groupId}
          />
        </div>
      </div>
    </ScopeProvider>
  );
}
