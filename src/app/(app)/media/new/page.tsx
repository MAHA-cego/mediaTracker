"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MediaSearch from "@/components/media/MediaSearch";
import { apiClientFetch } from "@/lib/api-client";
import type { Media } from "@/types/media";

export default function AddMediaPage() {
  const router = useRouter();
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [status, setStatus] = useState("PLANNED");
  const [rating, setRating] = useState(0);
  const [progress, setProgress] = useState(0);

  async function handleSave() {
    if (!selectedMedia) return;
    await apiClientFetch("/api/media-entry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mediaId: selectedMedia.id,
        status,
      }),
    });
    router.push("/media");
  }

  return (
    <div>
      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        <h1>Add Media</h1>
        {selectedMedia && <button onClick={handleSave}>Save</button>}
      </div>

      {!selectedMedia ? (
        <MediaSearch onSelect={setSelectedMedia} />
      ) : (
        <div>
          <p>
            Selected: <strong>{selectedMedia.title}</strong> ({selectedMedia.type})
            <button onClick={() => setSelectedMedia(null)} style={{ marginLeft: "10px" }}>
              Change
            </button>
          </p>

          <div>
            <label>Status </label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="PLANNED">Planned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="DROPPED">Dropped</option>
            </select>
          </div>

          <div>
            <label>Rating </label>
            <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
              <option value={0}>None</option>
              {[1, 2, 3, 4, 5].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Progress </label>
            <input
              type="number"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
            />
          </div>
        </div>
      )}
    </div>
  );
}
