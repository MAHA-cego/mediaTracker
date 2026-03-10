import { MediaEntry } from "@/types/media";

type Props = {
  entry: MediaEntry;
};

export default function MediaCard({ entry }: Props) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "12px",
        borderRadius: "8px",
      }}
    >
      <h3>{entry.media.title}</h3>
      <p>Status: {entry.status}</p>
      {entry.rating && <p>Rating: {entry.rating}</p>}
      {entry.progress && <p>Progress: {entry.progress}</p>}
    </div>
  );
}
