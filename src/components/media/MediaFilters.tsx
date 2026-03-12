"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function MediaFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();

  const status = params.get("status") ?? "";
  const sort = params.get("sort") ?? "created_desc";

  function updateParams(key: string, value: string) {
    const newParams = new URLSearchParams(params.toString());

    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }

    router.push(`${pathname}?${newParams.toString()}`);
  }

  return (
    <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
      <div>
        <label>Status</label>

        <select
          value={status}
          onChange={(e) => updateParams("status", e.target.value)}
        >
          <option value="">All</option>
          <option value="PLANNED">Planned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="DROPPED">Dropped</option>
        </select>
      </div>

      <div>
        <label>Sort</label>

        <select
          value={sort}
          onChange={(e) => updateParams("sort", e.target.value)}
        >
          <option value="created_desc">Newest</option>
          <option value="rating_desc">Rating</option>
        </select>
      </div>
    </div>
  );
}
