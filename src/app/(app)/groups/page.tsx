import { apiServerFetch } from "@/lib/api-server";
import Link from "next/link";
import CreateGroupForm from "@/components/groups/CreateGroupForm";

type Group = {
  id: string;
  name: string;
};

export default async function GroupsPage() {
  const groups = await apiServerFetch<Group[]>(`/api/groups`);

  return (
    <div>
      <h1>Your Groups</h1>

      <CreateGroupForm />

      {groups.length === 0 && <p>No groups yet.</p>}

      <ul>
        {groups.map((group) => (
          <li key={group.id}>
            <Link href={`/groups/${group.id}`}>{group.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
