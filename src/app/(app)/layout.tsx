import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  const res = await fetch("http://localhost:3000/api/me", {
    headers: {
      Cookie: cookieStore.toString(),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    redirect("/login");
  }

  const user = await res.json();

  return (
    <div>
      <header>
        <h2>Media Tracker</h2>
        <p>{user.username}</p>
      </header>

      <main>{children}</main>
    </div>
  );
}
