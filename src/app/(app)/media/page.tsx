import { apiServerFetch } from "@/lib/api-server";
import { MediaEntry } from "@/types/media";
import { ScopeProvider } from "@/context/ScopeContext";
import MediaList from "@/components/media/MediaList";
import AddMediaEntry from "@/components/media/AddMediaEntry";
import MediaFilters from "@/components/media/MediaFilters";

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;

  const query = new URLSearchParams();

  if (params.status) query.set("status", params.status);
  if (params.sort) query.set("sort", params.sort);

  const media = await apiServerFetch<MediaEntry[]>(
    `/api/media-entry?${query.toString()}`,
  );

  return (
    <ScopeProvider scope={{ type: "USER" }}>
      <div>
        <h1>Your Media</h1>

        <AddMediaEntry />

        <MediaFilters />

        <MediaList media={media} />
      </div>
    </ScopeProvider>
  );
}
