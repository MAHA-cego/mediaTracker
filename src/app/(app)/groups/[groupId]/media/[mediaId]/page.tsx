import { apiServerFetch } from "@/lib/api-server";
import { ScopeProvider } from "@/context/ScopeContext";
import MediaDetails from "@/components/media/MediaDetails";

type GroupMediaEntry = {
  id: string;
  status: string;
  rating: number | null;
  progress: number | null;
  media: {
    id: string;
    title: string;
    type: string;
  };
  addedBy: {
    id: string;
    username: string;
  };
};

export default async function GroupMediaDetailPage({
  params,
}: {
  params: Promise<{ groupId: string; mediaId: string }>;
}) {
  const { groupId, mediaId } = await params;
  const entry = await apiServerFetch<GroupMediaEntry>(
    `/api/groups/${groupId}/media/${mediaId}`,
  );

  return (
    <ScopeProvider scope={{ type: "GROUP", groupId }}>
      <div>
        <MediaDetails
          entry={entry}
          patchUrl={`/api/groups/${groupId}/media/${mediaId}`}
          redirectAfterDelete={`/groups/${groupId}/media`}
          extraInfo={<p>Added by: {entry.addedBy.username}</p>}
        />
      </div>
    </ScopeProvider>
  );
}
