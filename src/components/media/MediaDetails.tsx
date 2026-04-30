"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClientFetch } from "@/lib/api-client";

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
  patchUrl: string;
  deleteUrl?: string;
  redirectAfterDelete: string;
  extraInfo?: React.ReactNode;
};

export default function MediaDetails({
  entry,
  patchUrl,
  deleteUrl,
  redirectAfterDelete,
  extraInfo,
}: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState(entry.status);
  const [rating, setRating] = useState(entry.rating ?? 0);
  const [progress, setProgress] = useState(entry.progress ?? 0);

  async function save() {
    await apiClientFetch(patchUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        rating: rating === 0 ? null : rating,
        progress,
      }),
    });
    setEditing(false);
    router.refresh();
  }

  async function remove() {
    if (!deleteUrl) return;
    await apiClientFetch(deleteUrl, { method: "DELETE" });
    router.push(redirectAfterDelete);
  }

  return (
    <div>
      <div>
        <h1>{entry.media.title}</h1>
        {!editing && <button onClick={() => setEditing(true)}>Edit</button>}
        {editing && (
          <>
            <button onClick={save}>Done</button>
            {deleteUrl && <button onClick={remove}>Delete</button>}
          </>
        )}
      </div>

      {extraInfo}

      <div>
        <p>Type: {entry.media.type}</p>

        {editing ? (
          <div>
            <label>Status </label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="PLANNED">Planned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="DROPPED">Dropped</option>
            </select>
          </div>
        ) : (
          <p>Status: {entry.status}</p>
        )}

        {editing ? (
          <div>
            <label>Rating </label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            >
              <option value={0}>None</option>
              {[1, 2, 3, 4, 5].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <p>Rating: {entry.rating ?? "None"}</p>
        )}

        {editing ? (
          <div>
            <label>Progress </label>
            <input
              type="number"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
            />
          </div>
        ) : (
          <p>Progress: {entry.progress ?? 0}</p>
        )}
      </div>
    </div>
  );
}
