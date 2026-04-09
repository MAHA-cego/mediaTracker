"use client";

import { useRouter } from "next/navigation";
import { apiClientFetch } from "@/lib/api-client";

type Invite = {
  id: string;
  group: { name: string };
  inviter: { username: string };
};

export default function GroupInvites({ invites }: { invites: Invite[] }) {
  const router = useRouter();

  if (!invites.length) return <p>No invites</p>;

  return (
    <ul>
      {invites.map((invite) => (
        <li key={invite.id}>
          {invite.inviter.username} invited you to {invite.group.name}
          <button
            onClick={async () => {
              await apiClientFetch(`/api/groups/invites/${invite.id}/accept`, {
                method: "POST",
              });
              router.refresh();
            }}
          >
            Accept
          </button>
          <button
            onClick={async () => {
              await apiClientFetch(`/api/groups/invites/${invite.id}`, {
                method: "DELETE",
              });
              router.refresh();
            }}
          >
            Decline
          </button>
        </li>
      ))}
    </ul>
  );
}
