import type { JobPayload } from "@/lib/queue";

type GroupCreated = Extract<JobPayload, { type: "GROUP_CREATED" }>;
type GroupMemberAdded = Extract<JobPayload, { type: "GROUP_MEMBER_ADDED" }>;
type GroupMemberLeft = Extract<JobPayload, { type: "GROUP_MEMBER_LEFT" }>;
type GroupMediaAdded = Extract<JobPayload, { type: "GROUP_MEDIA_ADDED" }>;
type GroupMediaUpdated = Extract<JobPayload, { type: "GROUP_MEDIA_UPDATED" }>;
type GroupDeleted = Extract<JobPayload, { type: "GROUP_DELETED" }>;

export async function handleGroupCreated(data: GroupCreated) {
  console.log(`[job] GROUP_CREATED: group=${data.groupId} creator=${data.creatorId}`);
}

export async function handleGroupMemberAdded(data: GroupMemberAdded) {
  console.log(
    `[job] GROUP_MEMBER_ADDED: group=${data.groupId} user=${data.userId}`,
  );
  // Future: notify the added user
}

export async function handleGroupMemberLeft(data: GroupMemberLeft) {
  console.log(
    `[job] GROUP_MEMBER_LEFT: group=${data.groupId} user=${data.userId}`,
  );
}

export async function handleGroupMediaAdded(data: GroupMediaAdded) {
  console.log(
    `[job] GROUP_MEDIA_ADDED: group=${data.groupId} media=${data.mediaId} by=${data.addedById}`,
  );
  // Future: notify all group members
}

export async function handleGroupMediaUpdated(data: GroupMediaUpdated) {
  console.log(
    `[job] GROUP_MEDIA_UPDATED: group=${data.groupId} media=${data.mediaId}`,
  );
}

export async function handleGroupDeleted(data: GroupDeleted) {
  console.log(
    `[job] GROUP_DELETED: group=${data.groupId} affected members=${data.memberIds.length}`,
  );
  // Future: notify all former members
}
