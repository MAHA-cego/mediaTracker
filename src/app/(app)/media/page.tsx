import { apiServerFetch } from "@/lib/api-server";
import { MediaEntry } from "@/types/media";
import { ScopeProvider } from "@/context/ScopeContext";
import MediaList from "@/components/media/MediaList";
import AddMediaEntry from "@/components/media/AddMediaEntry";

export default async function MediaPage() {
  const media = await apiServerFetch<MediaEntry[]>("/api/media-entry");

  return (
    <ScopeProvider scope={{ type: "USER" }}>
      <div>
        <h1>Your Media</h1>

        <AddMediaEntry />

        <MediaList media={media} />
      </div>
    </ScopeProvider>
  );
}
