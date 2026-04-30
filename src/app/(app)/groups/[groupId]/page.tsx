import { apiServerFetch } from "@/lib/api-server";
import { ScopeProvider } from "@/context/ScopeContext";
import Link from "next/link";

type Group = {
  id: string;
  name: string;
  role: string;
};

export default async function GroupPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const group = await apiServerFetch<Group>(`/api/groups/${groupId}`);

  return (
    <ScopeProvider scope={{ type: "GROUP", groupId }}>
      <div>
        <h1>{group.name}</h1>

        <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
          <Link href={`/groups/${groupId}/media`}>
            <div style={{ border: "1px solid #ccc", padding: "16px" }}>Group Medias</div>
          </Link>
          <Link href={`/groups/${groupId}/members`}>
            <div style={{ border: "1px solid #ccc", padding: "16px" }}>Members</div>
          </Link>
          <Link href={`/groups/${groupId}/media/new`}>
            <div style={{ border: "1px solid #ccc", padding: "16px" }}>Add Media</div>
          </Link>
        </div>
      </div>
    </ScopeProvider>
  );
}
