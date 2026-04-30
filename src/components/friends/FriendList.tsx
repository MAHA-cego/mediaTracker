"use client";

import { useRouter } from "next/navigation";
import { apiClientFetch } from "@/lib/api-client";

type User = {
  id: string;
  username: string;
};

type Props = {
  friends: User[];
};

export default function FriendList({ friends }: Props) {
  const router = useRouter();

  async function removeFriend(friendId: string) {
    await apiClientFetch(`/api/friends/${friendId}`, { method: "DELETE" });
    router.refresh();
  }

  if (friends.length === 0) {
    return (
      <div>
        <p>No friends yet.</p>
      </div>
    );
  }

  return (
    <ul>
      {friends.map((friend) => (
        <li key={friend.id}>
          {friend.username}
          <button onClick={() => removeFriend(friend.id)} style={{ marginLeft: "10px" }}>
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
}
