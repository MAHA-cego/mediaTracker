import { apiServerFetch } from "@/lib/api-server";
import { ScopeProvider } from "@/context/ScopeContext";
import { PaginatedMedia } from "@/types/media";
import MediaCard from "@/components/media/MediaCard";
import MediaFilters from "@/components/media/MediaFilters";
import Link from "next/link";

export default async function GroupMediaPage({
  params,
  searchParams,
}: {
  params: Promise<{ groupId: string }>;
  searchParams: Promise<{ status?: string; sort?: string; page?: string }>;
}) {
  const { groupId } = await params;
  const filters = await searchParams;
  const page = Number(filters.page ?? 1);

  const query = new URLSearchParams();
  if (filters.status) query.set("status", filters.status);
  if (filters.sort) query.set("sort", filters.sort);
  query.set("page", page.toString());

  const result = await apiServerFetch<PaginatedMedia>(
    `/api/groups/${groupId}/media?${query.toString()}`,
  );

  const items = result.items;
  const GRID_SIZE = 12;
  const isFull = items.length >= GRID_SIZE;
  const emptySlots = isFull ? 0 : GRID_SIZE - items.length - 1;

  return (
    <ScopeProvider scope={{ type: "GROUP", groupId }}>
      <div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <h1>Group Medias</h1>
          <MediaFilters />
          <Link href={`/groups/${groupId}/media/new`}>Add Media</Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "12px",
            marginTop: "16px",
          }}
        >
          {items.slice(0, isFull ? GRID_SIZE : items.length).map((entry) => (
            <MediaCard
              key={entry.id}
              entry={entry}
              href={`/groups/${groupId}/media/${entry.media.id}`}
            />
          ))}

          {!isFull && (
            <Link href={`/groups/${groupId}/media/new`}>
              <div style={{ border: "1px dashed #ccc", padding: "16px" }}>+ Add Media</div>
            </Link>
          )}

          {Array.from({ length: emptySlots }).map((_, i) => (
            <div key={i} style={{ border: "1px solid #eee", padding: "16px" }} />
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "20px" }}>
          {page > 1 ? (
            <Link
              href={`/groups/${groupId}/media?${new URLSearchParams({ ...filters, page: String(page - 1) }).toString()}`}
            >
              Previous
            </Link>
          ) : (
            <span style={{ opacity: 0.5 }}>Previous</span>
          )}
          <span>Page {result.page} / {result.totalPages}</span>
          {page < result.totalPages ? (
            <Link
              href={`/groups/${groupId}/media?${new URLSearchParams({ ...filters, page: String(page + 1) }).toString()}`}
            >
              Next
            </Link>
          ) : (
            <span style={{ opacity: 0.5 }}>Next</span>
          )}
        </div>
      </div>
    </ScopeProvider>
  );
}
