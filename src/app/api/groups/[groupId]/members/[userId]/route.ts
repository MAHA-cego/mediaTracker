import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { cacheDel, CacheKey } from "@/lib/cache";
import { enqueue } from "@/lib/queue";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ groupId: string; userId: string }> },
) {
  try {
    const requesterId = req.headers.get("x-user-id");
    if (!requesterId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { groupId, userId } = await context.params;

    if (userId === requesterId) {
      return NextResponse.json({ error: "Cannot kick yourself" }, { status: 400 });
    }

    const requesterMembership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: requesterId } },
    });

    if (!requesterMembership || requesterMembership.role !== "OWNER") {
      return NextResponse.json({ error: "Only owners can kick members" }, { status: 403 });
    }

    const targetMembership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });

    if (!targetMembership) {
      return NextResponse.json({ error: "User is not a member" }, { status: 404 });
    }

    await prisma.groupMember.delete({
      where: { groupId_userId: { groupId, userId } },
    });

    await cacheDel(CacheKey.userGroups(userId), CacheKey.groupDetails(groupId));
    enqueue({ type: "GROUP_MEMBER_LEFT", groupId, userId });

    return NextResponse.json({ message: "Member removed" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
