"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClientFetch } from "@/lib/api-client";

type Props = {
  groupId: string;
  role: string;
  isLastOwner: boolean;
};

export default function GroupActions({ groupId, role, isLastOwner }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function leaveGroup() {
    setLoading(true);
    setError(null);
    try {
      await apiClientFetch(`/api/groups/${groupId}/leave`, { method: "POST" });
      router.push("/groups");
    } catch {
      setError("Failed to leave group. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteGroup() {
    if (!confirm("Delete this group permanently?")) return;
    setLoading(true);
    setError(null);
    try {
      await apiClientFetch(`/api/groups/${groupId}`, { method: "DELETE" });
      router.push("/groups");
    } catch {
      setError("Failed to delete group. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>Group Actions</h3>

      <button onClick={leaveGroup} disabled={loading || isLastOwner}>
        Leave Group
      </button>
      {isLastOwner && (
        <p style={{ color: "gray" }}>
          Transfer ownership before leaving the group.
        </p>
      )}

      {role === "OWNER" && (
        <button
          onClick={deleteGroup}
          disabled={loading}
          style={{ marginLeft: "10px" }}
        >
          Delete Group
        </button>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
