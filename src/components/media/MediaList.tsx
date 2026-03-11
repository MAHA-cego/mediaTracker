import { MediaEntry } from "@/types/media";
import MediaCard from "./MediaCard";

type Props = {
  media: MediaEntry[];

  scope: { type: "USER" } | { type: "GROUP"; groupId: string };
};

export default function MediaList({ media, scope }: Props) {
  if (media.length === 0) {
    return <p>No media tracked yet.</p>;
  }

  return (
    <div
      style={{
        display: "grid",
        gap: "12px",
      }}
    >
      {media.map((entry) => (
        <MediaCard key={entry.id} entry={entry} scope={scope} />
      ))}
    </div>
  );
}
