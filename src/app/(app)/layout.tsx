import { redirect } from "next/navigation";
import { apiServerFetch } from "@/lib/api-server";
import Topbar from "@/components/layout/Topbar";

type User = { id: string; username: string; email: string };
type Group = { id: string; name: string };

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await apiServerFetch<User>("/api/me").catch(() => null);
  if (!user) redirect("/login");

  const groups = await apiServerFetch<Group[]>("/api/groups").catch(() => []);

  return (
    <div>
      <Topbar user={user} groups={groups} />
      <main>{children}</main>
    </div>
  );
}
