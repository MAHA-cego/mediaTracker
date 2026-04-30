import { Worker } from "bullmq";
import redis from "@/lib/redis";
import type { JobPayload } from "@/lib/queue";
import {
  handleFriendRequestSent,
  handleFriendAccepted,
} from "./handlers/friendship";
import {
  handleMediaEntryCreated,
  handleMediaEntryUpdated,
  handleMediaEntryDeleted,
} from "./handlers/media";
import {
  handleGroupCreated,
  handleGroupMemberAdded,
  handleGroupMemberLeft,
  handleGroupMediaAdded,
  handleGroupMediaUpdated,
  handleGroupDeleted,
} from "./handlers/group";

const worker = new Worker<JobPayload>(
  "media-tracker",
  async (job) => {
    const data = job.data;
    switch (data.type) {
      case "FRIEND_REQUEST_SENT":  return handleFriendRequestSent(data);
      case "FRIEND_ACCEPTED":      return handleFriendAccepted(data);
      case "MEDIA_ENTRY_CREATED":  return handleMediaEntryCreated(data);
      case "MEDIA_ENTRY_UPDATED":  return handleMediaEntryUpdated(data);
      case "MEDIA_ENTRY_DELETED":  return handleMediaEntryDeleted(data);
      case "GROUP_CREATED":        return handleGroupCreated(data);
      case "GROUP_MEMBER_ADDED":   return handleGroupMemberAdded(data);
      case "GROUP_MEMBER_LEFT":    return handleGroupMemberLeft(data);
      case "GROUP_MEDIA_ADDED":    return handleGroupMediaAdded(data);
      case "GROUP_MEDIA_UPDATED":  return handleGroupMediaUpdated(data);
      case "GROUP_DELETED":        return handleGroupDeleted(data);
    }
  },
  {
    connection: redis,
    concurrency: 5,
  },
);

worker.on("completed", (job) => {
  console.log(`[worker] completed job ${job.id} (${job.name})`);
});

worker.on("failed", (job, err) => {
  console.error(`[worker] failed job ${job?.id} (${job?.name}):`, err.message);
});

console.log("[worker] started — waiting for jobs");

process.on("SIGTERM", async () => {
  console.log("[worker] shutting down...");
  await worker.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("[worker] shutting down...");
  await worker.close();
  process.exit(0);
});
