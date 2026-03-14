import { MediaEntry } from "@/types/media";
import MediaCard from "./MediaCard";

type Props = {
  media: MediaEntry[];
};

export default function MediaList({ media = [] }: Props) {
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
        <MediaCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
