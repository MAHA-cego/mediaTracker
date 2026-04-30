"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import MediaSearch from "@/components/media/MediaSearch";
import { apiClientFetch } from "@/lib/api-client";
import type { Media } from "@/types/media";

export default function AddGroupMediaPage() {
  const router = useRouter();
  const { groupId } = useParams<{ groupId: string }>();
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  async function handleSave() {
    if (!selectedMedia) return;
    await apiClientFetch(`/api/groups/${groupId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mediaId: selectedMedia.id }),
    });
    router.push(`/groups/${groupId}/media`);
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
        </div>
      )}
    </div>
  );
}
