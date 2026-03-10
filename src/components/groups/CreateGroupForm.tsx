"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClientFetch } from "@/lib/api-client";

export default function CreateGroupForm() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      setError("Group name is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiClientFetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      setName("");

      router.refresh();
    } catch (err: any) {
      setError("Failed to create group");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      <input
        type="text"
        placeholder="Group name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Group"}
      </button>

      {error && <p>{error}</p>}
    </form>
  );
}
