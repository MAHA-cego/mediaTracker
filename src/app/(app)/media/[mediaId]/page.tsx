import { apiServerFetch } from "@/lib/api-server";
import { ScopeProvider } from "@/context/ScopeContext";
import MediaDetails from "@/components/media/MediaDetails";

type MediaEntry = {
  id: string;
  status: string;
  rating: number | null;
  progress: number | null;

  media: {
    id: string;
    title: string;
    type: string;
  };
};

export default async function MediaPage({
  params,
}: {
  params: Promise<{ mediaId: string }>;
}) {
  const { mediaId } = await params;

  const entry = await apiServerFetch<MediaEntry>(`/api/media-entry/${mediaId}`);

  return (
    <ScopeProvider scope={{ type: "USER" }}>
      <div>
        <MediaDetails entry={entry} />
      </div>
    </ScopeProvider>
  );
}
