import { apiServerFetch } from "@/lib/api-server";
import { MediaEntry } from "@/types/media";
import MediaList from "@/components/media/MediaList";

export default async function DashboardPage() {
  const media = await apiServerFetch<MediaEntry[]>("/api/media-entry");

  return (
    <div>
      <h1>Your Media</h1>

      <MediaList media={media} />
    </div>
  );
}
