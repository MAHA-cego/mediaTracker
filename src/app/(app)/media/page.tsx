import { apiServerFetch } from "@/lib/api-server";
import MediaList from "@/components/media/MediaList";
import { MediaEntry } from "@/types/media";
import { ScopeProvider } from "@/context/ScopeContext";

export default async function MediaPage() {
  const media = await apiServerFetch<MediaEntry[]>("/api/media-entry");

  return (
    <ScopeProvider scope={{ type: "USER" }}>
      <div>
        <h1>Your Media</h1>
        <MediaList media={media} />
      </div>
    </ScopeProvider>
  );
}
