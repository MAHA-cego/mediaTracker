import { apiServerFetch } from "@/lib/api-server";
import { MediaEntry } from "@/types/media";
import MediaList from "@/components/media/MediaList";
import AddGroupMediaForm from "@/components/groups/AddGroupMediaForm";

export default async function GroupPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;

  const media = await apiServerFetch<MediaEntry[]>(
    `/api/groups/${groupId}/media`,
  );

  return (
    <div>
      <h1>Group Media</h1>

      <AddGroupMediaForm groupId={groupId} />

      <MediaList media={media} />
    </div>
  );
}
