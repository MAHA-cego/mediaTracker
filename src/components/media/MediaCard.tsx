"use client";

import { MediaEntry } from "@/types/media";
import Link from "next/link";

type Props = {
  entry: MediaEntry;
  href?: string;
};

export default function MediaCard({ entry, href }: Props) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "12px",
        borderRadius: "8px",
      }}
    >
      <h3>
        <Link href={href ?? `/media/${entry.id}`}>{entry.media.title}</Link>
      </h3>
    </div>
  );
}
