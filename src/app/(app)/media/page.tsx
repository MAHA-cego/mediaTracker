import { apiServerFetch } from "@/lib/api-server";
import { ScopeProvider } from "@/context/ScopeContext";
import { PaginatedMedia } from "@/types/media";
import MediaList from "@/components/media/MediaList";
import AddMediaEntry from "@/components/media/AddMediaEntry";
import MediaFilters from "@/components/media/MediaFilters";
import Link from "next/link";

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;

  const page = Number(params.page ?? 1);

  const query = new URLSearchParams();

  if (params.status) query.set("status", params.status);
  if (params.sort) query.set("sort", params.sort);
  query.set("page", page.toString());

  const result = await apiServerFetch<PaginatedMedia>(
    `/api/media-entry?${query.toString()}`,
  );

  return (
    <ScopeProvider scope={{ type: "USER" }}>
      <div>
        <h1>Your Media</h1>

        <AddMediaEntry />

        <MediaFilters />

        <MediaList media={result.items} />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginTop: "20px",
          }}
        >
          {page > 1 ? (
            <Link
              href={`/media?${new URLSearchParams({
                ...params,
                page: String(page - 1),
              }).toString()}`}
            >
              Previous Page
            </Link>
          ) : (
            <span style={{ opacity: 0.5 }}>Previous</span>
          )}

          <span>
            Page {result.page} / {result.totalPages}
          </span>

          {page < result.totalPages ? (
            <Link
              href={`/media?${new URLSearchParams({
                ...params,
                page: String(page + 1),
              }).toString()}`}
            >
              Next Page
            </Link>
          ) : (
            <span style={{ opacity: 0.5 }}>Next</span>
          )}
        </div>
      </div>
    </ScopeProvider>
  );
}
