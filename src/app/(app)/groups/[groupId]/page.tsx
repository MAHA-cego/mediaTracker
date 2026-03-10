import { apiFetch } from "@/lib/api";

type Media = {
  media: {
    title: string;
  };
  status: string;
};

export default async function GroupPage({
  params,
}: {
  params: { groupId: string };
}) {
  const media = await apiFetch<Media[]>(`/api/groups/${params.groupId}/media`);

  return (
    <div>
      <h1>Group Media</h1>

      <ul>
        {media.map((entry, i) => (
          <li key={i}>
            {entry.media.title} - {entry.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
