import { apiServerFetch } from "@/lib/api-server";
import MediaList from "@/components/media/MediaList";
import { MediaEntry } from "@/types/media";

export default async function MediaPage() {
  const media = await apiServerFetch<MediaEntry[]>("/api/media-entry");

  return (
    <div>
      <h1>Your Media</h1>

      <MediaList media={media} scope={{ type: "USER" }} />
    </div>
  );
}
