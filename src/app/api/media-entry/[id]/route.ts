import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: entryId } = await context.params;
    const body = await req.json();

    const existing = await prisma.mediaEntry.findUnique({
      where: { id: entryId },
    });

    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    const allowedStatuses = ["PLANNED", "IN_PROGRESS", "COMPLETED", "DROPPED"];

    if (body.status !== undefined) {
      if (!allowedStatuses.includes(body.status)) {
        return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
      }
    }

    if (body.rating !== undefined) {
      if (body.rating !== null && (typeof body.rating !== "number" || body.rating < 1 || body.rating > 5)) {
        return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
      }
    }

    if (body.progress !== undefined) {
      if (body.progress !== null && (typeof body.progress !== "number" || body.progress < 0)) {
        return NextResponse.json({ error: "Invalid progress value" }, { status: 400 });
      }
    }

    const updateData: Record<string, unknown> = {};

    if (body.status !== undefined) {
      updateData.status = body.status;

      if (body.status === "IN_PROGRESS" && !existing.startedAt) {
        updateData.startedAt = new Date();
      }

      if (body.status === "COMPLETED" && !existing.completedAt) {
        updateData.completedAt = new Date();
      }
    }

    if (body.rating !== undefined) {
      updateData.rating = body.rating;
    }

    if (body.progress !== undefined) {
      updateData.progress = body.progress;
    }

    const updated = await prisma.mediaEntry.update({
      where: { id: entryId },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: entryId } = await context.params;

    const existing = await prisma.mediaEntry.findUnique({
      where: { id: entryId },
    });

    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    await prisma.mediaEntry.delete({
      where: { id: entryId },
    });

    return NextResponse.json({ message: "Deleted" });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const entry = await prisma.mediaEntry.findUnique({
      where: { id },
      include: {
        media: true,
      },
    });

    if (!entry || entry.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
