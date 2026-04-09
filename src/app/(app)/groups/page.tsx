import { apiServerFetch } from "@/lib/api-server";
import Link from "next/link";
import CreateGroupForm from "@/components/groups/CreateGroupForm";
import GroupInvites from "@/components/groups/GroupInvites";

type Group = {
  id: string;
  name: string;
};

type Invite = {
  id: string;
  group: { name: string };
  inviter: { username: string };
};

export default async function GroupsPage() {
  const groups = await apiServerFetch<Group[]>(`/api/groups`);

  const invites = await apiServerFetch<Invite[]>("/api/groups/invites");

  return (
    <div>
      {invites.length > 0 && (
        <>
          <h2>Your invites</h2>
          <GroupInvites invites={invites} />
        </>
      )}

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
