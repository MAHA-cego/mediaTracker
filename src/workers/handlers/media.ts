import type { JobPayload } from "@/lib/queue";

type MediaEntryCreated = Extract<JobPayload, { type: "MEDIA_ENTRY_CREATED" }>;
type MediaEntryUpdated = Extract<JobPayload, { type: "MEDIA_ENTRY_UPDATED" }>;
type MediaEntryDeleted = Extract<JobPayload, { type: "MEDIA_ENTRY_DELETED" }>;

export async function handleMediaEntryCreated(data: MediaEntryCreated) {
  console.log(
    `[job] MEDIA_ENTRY_CREATED: user=${data.userId} entry=${data.entryId} media=${data.mediaId}`,
  );
  // Future: update user stats (total by status, average rating)
  // Future: record activity feed event
}

export async function handleMediaEntryUpdated(data: MediaEntryUpdated) {
  console.log(
    `[job] MEDIA_ENTRY_UPDATED: user=${data.userId} entry=${data.entryId}`,
  );
  // Future: recompute user stats
}

export async function handleMediaEntryDeleted(data: MediaEntryDeleted) {
  console.log(
    `[job] MEDIA_ENTRY_DELETED: user=${data.userId} entry=${data.entryId}`,
  );
  // Future: recompute user stats
}
