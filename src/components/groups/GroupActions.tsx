"use client";

import { useRouter } from "next/navigation";
import { apiClientFetch } from "@/lib/api-client";

type Props = {
  groupId: string;
  role: string;
  isLastOwner: boolean;
};

export default function GroupActions({ groupId, role, isLastOwner }: Props) {
  const router = useRouter();

  async function leaveGroup() {
    await apiClientFetch(`/api/groups/${groupId}/leave`, {
      method: "POST",
    });

    router.push("/groups");
  }

  async function deleteGroup() {
    if (!confirm("Delete this group permanently?")) {
      return;
    }

    await apiClientFetch(`/api/groups/${groupId}`, {
      method: "DELETE",
    });

    router.push("/groups");
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>Group Actions</h3>

      <button onClick={leaveGroup} disabled={isLastOwner}>
        Leave Group
      </button>
      {isLastOwner && (
        <p style={{ color: "gray" }}>
          Transfer ownership before leaving the group.
        </p>
      )}

      {role === "OWNER" && (
        <button onClick={deleteGroup} style={{ marginLeft: "10px" }}>
          Delete Group
        </button>
      )}
    </div>
  );
}
