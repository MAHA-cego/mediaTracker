import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPagination } from "@/lib/pagination";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ groupId: string }> },
) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { groupId } = await context.params;
    const body = await req.json();
    const { mediaId } = body;

    if (!mediaId || typeof mediaId !== "string") {
      return NextResponse.json({ error: "invalid mediaId" }, { status: 400 });
    }

    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const media = await prisma.media.findUnique({
      where: { id: mediaId },
    });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    try {
      const entry = await prisma.groupMediaEntry.create({
        data: {
          groupId,
          mediaId,
          addedById: userId,
        },
      });

      return NextResponse.json(entry, { status: 201 });
    } catch (error: any) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Media already exists in this group" },
          { status: 400 },
        );
      }
      throw error;
    }
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ groupId: string }> },
) {
  try {
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { groupId } = await context.params;

    const { searchParams } = req.nextUrl;

    const status = searchParams.get("status");
    const sort = searchParams.get("sort");

    const { page, limit, skip } = getPagination(searchParams);

    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const where: any = { groupId };

    const allowedStatuses = ["PLANNED", "IN_PROGRESS", "COMPLETED", "DROPPED"];

    if (status) {
      if (!allowedStatuses.includes(status)) {
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

    const items = await prisma.groupMediaEntry.findMany({
      where,
      include: {
        media: true,
      },
      orderBy,
      skip,
      take: limit,
    });

    const total = await prisma.groupMediaEntry.count({
      where,
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      items,
      page,
      totalPages,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
