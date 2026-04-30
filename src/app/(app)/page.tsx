import { apiServerFetch } from "@/lib/api-server";
import { ScopeProvider } from "@/context/ScopeContext";
import { PaginatedMedia } from "@/types/media";
import Link from "next/link";

export default async function DashboardPage() {
  let recentMedia: PaginatedMedia["items"] = [];

  try {
    const result = await apiServerFetch<PaginatedMedia>("/api/media-entry?page=1");
    recentMedia = result.items.slice(0, 8);
  } catch {
    recentMedia = [];
  }

  const emptySlots = Math.max(0, 8 - recentMedia.length);

  return (
    <ScopeProvider scope={{ type: "USER" }}>
      <div>
        <h1>Dashboard</h1>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
          <Link href="/media">
            <div style={{ border: "1px solid #ccc", padding: "16px" }}>My Medias</div>
          </Link>
          <Link href="/friends">
            <div style={{ border: "1px solid #ccc", padding: "16px" }}>Friends</div>
          </Link>
          <Link href="/groups">
            <div style={{ border: "1px solid #ccc", padding: "16px" }}>Groups</div>
          </Link>
          <Link href="/media/new">
            <div style={{ border: "1px solid #ccc", padding: "16px" }}>Add Media</div>
          </Link>

          {recentMedia.map((entry) => (
            <Link key={entry.id} href={`/media/${entry.id}`}>
              <div style={{ border: "1px solid #ccc", padding: "16px" }}>
                {entry.media.title}
              </div>
            </Link>
          ))}

          {Array.from({ length: emptySlots }).map((_, i) => (
            <div key={i} style={{ border: "1px solid #ccc", padding: "16px", background: "#000" }} />
          ))}
        </div>
      </div>
    </ScopeProvider>
  );
}
