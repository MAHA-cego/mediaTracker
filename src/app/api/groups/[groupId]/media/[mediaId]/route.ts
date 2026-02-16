import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ groupId: string; mediaId: string }> },
) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { groupId, mediaId } = await context.params;
    const body = await req.json();

    const { status, rating, progress } = body;

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

    const existing = await prisma.groupMediaEntry.findUnique({
      where: {
        groupId_mediaId: {
          groupId,
          mediaId,
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Media not found in group" },
        { status: 400 },
      );
    }

    const allowedStatuses = ["PLANNED", "IN_PROGRESS", "COMPLETED", "DROPPED"];

    if (status) {
      if (!allowedStatuses.includes(status)) {
        return NextResponse.json(
          { error: "Invalid status value" },
          { status: 400 },
        );
      }
    }

    if (rating !== undefined) {
      if (
        rating !== null &&
        (typeof rating !== "number" || rating < 1 || rating > 5)
      ) {
        return NextResponse.json(
          { error: "Rating must be between 1 and 5" },
          { status: 400 },
        );
      }
    }

    if (progress !== undefined) {
      if (progress !== null && (typeof progress !== "number" || progress < 0)) {
        return NextResponse.json(
          { error: "Invalid progress value" },
          { status: 400 },
        );
      }
    }

    const updateData: any = {};

    if (status !== undefined) updateData.status = status;
    if (rating !== undefined) updateData.rating = rating;
    if (progress !== undefined) updateData.progress = progress;

    if (status === "IN_PROGRESS" && !existing.startedAt) {
      updateData.startedAt = new Date();
    }

    if (status === "COMPLETED") {
      updateData.completedAt = new Date();
    }

    const updated = await prisma.groupMediaEntry.update({
      where: {
        groupId_mediaId: {
          groupId,
          mediaId,
        },
      },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
