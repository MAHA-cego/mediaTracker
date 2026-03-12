"use client";

import { useRouter } from "next/navigation";
import { apiClientFetch } from "@/lib/api-client";

type User = {
  id: string;
  username: string;
};

type FriendRequests = {
  id: string;
  requester: User;
};

type Props = {
  requests: FriendRequests[];
};

export default function FriendRequests({ requests }: Props) {
  const router = useRouter();

  async function acceptRequest(id: string) {
    await apiClientFetch("/api/friends/accept", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requestId: id }),
    });

    router.refresh();
  }

  if (requests.length === 0) {
    return (
      <div>
        <h3>Friend Requests</h3>
        <p>No pending requests</p>
      </div>
    );
  }

  return (
    <div>
      <h3>Friend Requests</h3>

      <ul>
        {requests.map((req) => (
          <li key={req.id}>
            {req.requester.username}

            <button
              onClick={() => acceptRequest(req.id)}
              style={{ marginLeft: "10px" }}
            >
              Accept
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
