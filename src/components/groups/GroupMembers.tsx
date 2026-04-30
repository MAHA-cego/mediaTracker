"use client";

import { useRouter } from "next/navigation";
import { apiClientFetch } from "@/lib/api-client";

type Member = {
  id: string;
  username: string;
  role: string;
};

type Props = {
  members: Member[];
  currentUserId?: string;
  currentUserRole?: string;
  groupId?: string;
};

export default function GroupMembers({
  members,
  currentUserId,
  currentUserRole,
  groupId,
}: Props) {
  const router = useRouter();
  const isOwner = currentUserRole === "OWNER" && !!groupId;

  async function kickMember(userId: string) {
    await apiClientFetch(`/api/groups/${groupId}/members/${userId}`, {
      method: "DELETE",
    });
    router.refresh();
  }

  async function makeOwner(userId: string) {
    await apiClientFetch(`/api/groups/${groupId}/transfer-ownership`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    router.refresh();
  }

  if (members.length === 0) {
    return <p>No members.</p>;
  }

  return (
    <ul>
      {members.map((m) => (
        <li key={m.id}>
          {m.username} — {m.role}
          {isOwner && m.id !== currentUserId && (
            <>
              <button onClick={() => makeOwner(m.id)} style={{ marginLeft: "10px" }}>
                Make Owner
              </button>
              <button onClick={() => kickMember(m.id)} style={{ marginLeft: "6px" }}>
                Kick
              </button>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
