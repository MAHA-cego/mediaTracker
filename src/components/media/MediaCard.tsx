"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClientFetch } from "@/lib/api-client";
import { MediaEntry } from "@/types/media";
import Link from "next/link";

type Props = {
  entry: MediaEntry;

  scope: { type: "USER" } | { type: "GROUP"; groupId: string };
};

export default function MediaCard({ entry, scope }: Props) {
  const router = useRouter();

  const [status, setStatus] = useState(entry.status);
  const [rating, setRating] = useState(entry.rating ?? 0);
  const [progress, setProgress] = useState(entry.progress ?? 0);

  function getEndpoint() {
    if (scope.type === "USER") {
      return `/api/media-entry/${entry.id}`;
    }

    return `/api/groups/${scope.groupId}/media/${entry.media.id}`;
  }

  async function update(data: any) {
    await apiClientFetch(getEndpoint(), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    router.refresh();
  }

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "12px",
        borderRadius: "8px",
      }}
    >
      <h3>
        <Link href={`/media/${entry.id}`}>{entry.media.title}</Link>
      </h3>
    </div>
  );
}
