import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getPagination } from "@/lib/pagination";
import { cacheGet, cacheSet, bumpNamespaceVersion, getNamespaceVersion, CacheKey } from "@/lib/cache";
import { enqueue } from "@/lib/queue";

export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (!body.mediaId) {
      return NextResponse.json(
        { error: "mediaId is required" },
        { status: 400 },
      );
    }

    const entry = await prisma.mediaEntry.create({
      data: {
        userId,
        mediaId: body.mediaId,
        status: body.status ?? "PLANNED",
      },
    });

    await bumpNamespaceVersion(CacheKey.userEntriesNs(userId));
    enqueue({ type: "MEDIA_ENTRY_CREATED", userId, entryId: entry.id, mediaId: body.mediaId });

    return NextResponse.json(entry, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Entry already exists for this media" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;

  const status = searchParams.get("status");
  const sort = searchParams.get("sort");

  const { page, limit, skip } = getPagination(searchParams);

  const where: any = { userId };

  const validStatuses = ["PLANNED", "IN_PROGRESS", "COMPLETED", "DROPPED"];

  if (status) {
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status filter" },
        { status: 400 },
      );
    }

    where.status = status;
  }

  let orderBy: any = { createdAt: "desc" };

  if (sort === "rating_desc") {
    orderBy = { rating: "desc" };
  }

  const ns = CacheKey.userEntriesNs(userId);
  const version = await getNamespaceVersion(ns);
  const cacheKey = `${ns}:v${version}:${page}:${status ?? "all"}:${sort ?? "default"}`;

  const cached = await cacheGet<unknown>(cacheKey);
  if (cached) return NextResponse.json(cached);

  const items = await prisma.mediaEntry.findMany({
    where,
    include: { media: true },
    orderBy,
    skip,
    take: limit,
  });

  const total = await prisma.mediaEntry.count({ where });
  const totalPages = Math.ceil(total / limit);

  const result = { items, page, totalPages };
  await cacheSet(cacheKey, result, 60);
  return NextResponse.json(result);
}
