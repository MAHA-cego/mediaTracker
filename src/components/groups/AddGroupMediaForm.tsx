"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClientFetch } from "@/lib/api-client";
import MediaSearch from "@/components/media/MediaSearch";

type Media = {
  id: string;
  title: string;
};

type Props = {
  groupId: string;
};

export default function AddGroupMediaForm({ groupId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSelect(media: Media) {
    setLoading(true);

    try {
      await apiClientFetch(`/api/groups/${groupId}/media`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mediaId: media.id }),
      });

      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h3>Add Media</h3>

      <MediaSearch onSelect={handleSelect} />

      {loading && <p>Adding...</p>}
    </div>
  );
}
