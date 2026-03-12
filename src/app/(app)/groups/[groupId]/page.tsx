import { apiServerFetch } from "@/lib/api-server";
import { MediaEntry } from "@/types/media";
import MediaList from "@/components/media/MediaList";
import AddGroupMediaForm from "@/components/groups/AddGroupMediaForm";
import AddGroupMember from "@/components/groups/AddGroupMember";
import GroupMembers from "@/components/groups/GroupMembers";
import GroupActions from "@/components/groups/GroupActions";
import TransferOwnership from "@/components/groups/TransferOwnership";

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
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;

  const media = await apiServerFetch<MediaEntry[]>(
    `/api/groups/${groupId}/media`,
  );

  const friends = await apiServerFetch<User[]>("/api/friends");

  const group = await apiServerFetch<Group>(`/api/groups/${groupId}`);

  const memberIds = new Set(group.members.map((m) => m.id));

  const availableFriends = friends.filter((f) => !memberIds.has(f.id));

  const ownerCount = group.members.filter((m) => m.role === "OWNER").length;

  const isLastOwner = group.role === "OWNER" && ownerCount === 1;

  return (
    <div>
      <h1>{group.name}</h1>

      <GroupMembers members={group.members} />

      <AddGroupMember groupId={groupId} friends={availableFriends} />

      <TransferOwnership
        groupId={groupId}
        members={group.members}
        role={group.role}
      />

      <AddGroupMediaForm groupId={groupId} />

      <MediaList media={media} scope={{ type: "GROUP", groupId }} />

      <GroupActions
        groupId={groupId}
        role={group.role}
        isLastOwner={isLastOwner}
      />
    </div>
  );
}
