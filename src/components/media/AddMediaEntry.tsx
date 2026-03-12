"use client";

import { useRouter } from "next/navigation";
import { apiClientFetch } from "@/lib/api-client";
import MediaSearch from "./MediaSearch";

type Media = {
  id: string;
  title: string;
};

export default function AddMediaEntry() {
  const router = useRouter();

  async function handleSelect(media: Media) {
    await apiClientFetch("/api/media-entry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mediaId: media.id,
      }),
    });

    router.refresh();
  }

  return (
    <div>
      <h3>Add Media</h3>

      <MediaSearch onSelect={handleSelect} />
    </div>
  );
}
