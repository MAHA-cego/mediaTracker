import { prisma } from "@/lib/prisma";
import { error } from "console";
import { NextResponse } from "next/server";

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

    const updateData: any = {};

    if (body.status) {
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
