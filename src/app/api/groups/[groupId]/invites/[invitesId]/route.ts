import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ inviteId: string }> },
) {
  const userId = req.headers.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { inviteId } = await context.params;

  const invite = await prisma.groupInvite.findUnique({
    where: { id: inviteId },
  });

  if (!invite || invite.receiverId !== userId) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  await prisma.groupInvite.delete({
    where: { id: inviteId },
  });

  return NextResponse.json({ success: true });
}
