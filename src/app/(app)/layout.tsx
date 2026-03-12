import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";

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
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      <header
        style={{
          display: "flex",
          gap: "20px",
          borderBottom: "1px solid #ddd",
          paddingBottom: "12px",
          marginBottom: "20px",
        }}
      >
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/media">Media</Link>
        <Link href="/groups">Groups</Link>
        <Link href="/friends">Friends</Link>
      </header>

      <main>{children}</main>
    </div>
  );
}
