import { apiFetch } from "@/lib/api";

type MediaEntry = {
  id: string;
  media: {
    title: string;
  };
  status: string;
  rating: number | null;
};

export default async function DashboardPage() {
  const media = await apiFetch<MediaEntry[]>("/api/media-entry");

  return (
    <div>
      <h1>Your Media</h1>

      <ul>
        {media.map((entry) => (
          <li key={entry.id}>
            {entry.media.title} - {entry.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
