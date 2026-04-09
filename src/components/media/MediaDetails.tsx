"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClientFetch } from "@/lib/api-client";
import { useScope } from "@/context/ScopeContext";

type MediaEntry = {
  id: string;
  status: string;
  rating: number | null;
  progress: number | null;

  media: {
    id: string;
    title: string;
    type: string;
  };
};

type Props = {
  entry: MediaEntry;
};

export default function MediaDetail({ entry }: Props) {
  const router = useRouter();

  const scope = useScope();

  const [status, setStatus] = useState(entry.status);
  const [rating, setRating] = useState(entry.rating ?? 0);
  const [progress, setProgress] = useState(entry.progress ?? 0);

  async function update(data: any) {
    await apiClientFetch(`/api/media-entry/${entry.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    router.refresh();
  }

  return (
    <div>
      <h1>{entry.media.title}</h1>

      <div>
        <label>Status</label>

        <select
          value={status}
          onChange={(e) => {
            const value = e.target.value;
            setStatus(value);
            update({ status: value });
          }}
        >
          <option value="PLANNED">Planned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="DROPPED">Dropped</option>
        </select>
      </div>

      <div>
        <label>Rating</label>

        <select
          value={rating}
          onChange={(e) => {
            const value = Number(e.target.value);
            setRating(value);
            update({ rating: value });
          }}
        >
          <option value={0}>None</option>
          {[1, 2, 3, 4, 5].map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Progress </label>

        <input
          type="number"
          value={progress}
          onChange={(e) => {
            const value = Number(e.target.value);
            setProgress(value);
            update({ progress: value });
          }}
        />
      </div>
    </div>
  );
}
