"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClientFetch } from "@/lib/api-client";

type Member = {
  id: string;
  username: string;
  role: string;
};

type Props = {
  groupId: string;
  members: Member[];
  role: string;
};

export default function TransferOwnership({ groupId, members, role }: Props) {
  const router = useRouter();

  const [selected, setSelected] = useState("");

  if (role !== "OWNER") {
    return null;
  }

  const candidates = members.filter((m) => m.role !== "OWNER");

  async function transfer() {
    if (!selected) return;

    await apiClientFetch(`/api/groups/${groupId}/transfer-ownership`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: selected,
      }),
    });

    router.refresh();
  }

  if (candidates.length === 0) {
    return null;
  }

  return (
    <div>
      <h3>Transfer Ownership</h3>

      <select value={selected} onChange={(e) => setSelected(e.target.value)}>
        <option value="">Select member</option>

        {candidates.map((m) => (
          <option key={m.id} value={m.id}>
            {m.username}
          </option>
        ))}
      </select>

      <button onClick={transfer}>Transfer</button>
    </div>
  );
}
