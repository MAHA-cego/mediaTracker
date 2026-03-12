"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClientFetch } from "@/lib/api-client";

type User = {
  id: string;
  username: string;
};

type Props = {
  groupId: string;
  friends: User[];
};

export default function AddGroupMember({ groupId, friends }: Props) {
  const [selected, setSelected] = useState<string>("");

  const router = useRouter();

  async function addMember() {
    if (!selected) return;

    await apiClientFetch(`/api/groups/${groupId}/members`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: selected,
      }),
    });

    setSelected("");

    router.refresh();
  }

  return (
    <div>
      <h3>Add Member</h3>

      <select value={selected} onChange={(e) => setSelected(e.target.value)}>
        <option value="">Select friend</option>

        {friends.map((f) => (
          <option key={f.id} value={f.id}>
            {f.username}
          </option>
        ))}
      </select>

      <button onClick={addMember}>Add</button>
    </div>
  );
}
