import type { JobPayload } from "@/lib/queue";

type FriendRequestSent = Extract<JobPayload, { type: "FRIEND_REQUEST_SENT" }>;
type FriendAccepted = Extract<JobPayload, { type: "FRIEND_ACCEPTED" }>;

export async function handleFriendRequestSent(data: FriendRequestSent) {
  console.log(
    `[job] FRIEND_REQUEST_SENT: ${data.requesterId} → ${data.receiverId}`,
  );
  // Future: send in-app notification or email to receiver
}

export async function handleFriendAccepted(data: FriendAccepted) {
  console.log(
    `[job] FRIEND_ACCEPTED: friendship formed between ${data.userAId} and ${data.userBId}`,
  );
  // Future: notify both users, update activity feed
}
