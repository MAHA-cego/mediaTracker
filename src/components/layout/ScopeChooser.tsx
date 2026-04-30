"use client";

import { usePathname, useRouter } from "next/navigation";

type Group = { id: string; name: string };

type Props = {
  groups: Group[];
};

export default function ScopeChooser({ groups }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const groupMatch = pathname.match(/^\/groups\/([^/]+)/);
  const activeGroupId = groupMatch?.[1] ?? null;
  const currentValue = activeGroupId ? `/groups/${activeGroupId}` : "/dashboard";

  return (
    <select
      value={currentValue}
      onChange={(e) => router.push(e.target.value)}
    >
      <option value="/dashboard">Personal</option>
      {groups.map((g) => (
        <option key={g.id} value={`/groups/${g.id}`}>
          {g.name}
        </option>
      ))}
    </select>
  );
}
