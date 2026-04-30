import { Queue } from "bullmq";
import redis from "./redis";

export type JobPayload =
  | { type: "FRIEND_REQUEST_SENT"; requesterId: string; receiverId: string }
  | { type: "FRIEND_ACCEPTED"; userAId: string; userBId: string }
  | { type: "MEDIA_ENTRY_CREATED"; userId: string; entryId: string; mediaId: string }
  | { type: "MEDIA_ENTRY_UPDATED"; userId: string; entryId: string }
  | { type: "MEDIA_ENTRY_DELETED"; userId: string; entryId: string }
  | { type: "GROUP_CREATED"; groupId: string; creatorId: string }
  | { type: "GROUP_MEMBER_ADDED"; groupId: string; userId: string }
  | { type: "GROUP_MEMBER_LEFT"; groupId: string; userId: string }
  | { type: "GROUP_MEDIA_ADDED"; groupId: string; mediaId: string; addedById: string }
  | { type: "GROUP_MEDIA_UPDATED"; groupId: string; mediaId: string }
  | { type: "GROUP_DELETED"; groupId: string; memberIds: string[] };

export const mediaTrackerQueue = new Queue<JobPayload>("media-tracker", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

export function enqueue(payload: JobPayload): Promise<unknown> {
  return mediaTrackerQueue.add(payload.type, payload);
}
