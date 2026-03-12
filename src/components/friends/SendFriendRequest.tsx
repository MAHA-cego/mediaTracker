"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClientFetch } from "@/lib/api-client";

export default function SendFriendRequest() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      await apiClientFetch("/api/friends/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      setUsername("");
      router.refresh();
    } catch (err) {
      setError("Failed to send request");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Friend</h3>

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <button type="submit">Send Request</button>

      {error && <p>{error}</p>}
    </form>
  );
}
