import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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

  const page = Number(searchParams.get("page") ?? 1);
  const limit = 10;

  const skip = (page - 1) * limit;

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

  const items = await prisma.mediaEntry.findMany({
    where,
    include: {
      media: true,
    },
    orderBy,
    skip,
    take: limit,
  });

  const total = await prisma.mediaEntry.count({
    where,
  });

  const totalPages = Math.ceil(total / limit);

  return NextResponse.json({
    items,
    page,
    totalPages,
  });
}
