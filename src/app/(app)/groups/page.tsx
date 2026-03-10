import { apiFetch } from "@/lib/api";

type Group = {
  id: string;
  name: string;
};

export default async function GroupPage() {
  const groups = await apiFetch<Group[]>("/api/groups");

  return (
    <div>
      <h1>Your Groups</h1>

      <ul>
        {groups.map((group) => (
          <li key={group.id}>
            <a href={`/group/${group.id}`}>{group.name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
