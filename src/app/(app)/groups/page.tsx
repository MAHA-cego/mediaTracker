import { apiServerFetch } from "@/lib/api-server";
import Link from "next/link";
import CreateGroupForm from "@/components/groups/CreateGroupForm";

type Group = {
  id: string;
  name: string;
  memberCount: number;
};

export default async function GroupsPage() {
  const groups = await apiServerFetch<Group[]>("/api/groups");

  return (
    <div>
      <h1>My Groups</h1>
      <CreateGroupForm />

      <div style={{ display: "flex", gap: "32px", marginTop: "16px" }}>
        <div style={{ flex: 1 }}>
          <h2>Groups</h2>
          {groups.length === 0 ? (
            <p>No groups yet.</p>
          ) : (
            <ul>
              {groups.map((group) => (
                <li key={group.id}>
                  <Link href={`/groups/${group.id}`}>{group.name}</Link>
                  {" "}— {group.memberCount} member{group.memberCount !== 1 ? "s" : ""}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <h2>Group Invites</h2>
          <p>Group invites coming soon.</p>
        </div>
      </div>
    </div>
  );
}
