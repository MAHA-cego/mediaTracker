import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ groupId: string }> },
) {
  try {
    const requesterId = req.headers.get("x-user-id");

    if (!requesterId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { groupId } = await context.params;
    const body = await req.json();
    const { userId } = body;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }

    if (userId === requesterId) {
      return NextResponse.json(
        { error: "You are already in the group" },
        { status: 400 },
      );
    }

    const requesterMembership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: requesterId,
        },
      },
    });

    if (!requesterMembership || requesterMembership.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only owners can add members" },
        { status: 403 },
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [userAId, userBId] =
      requesterId < userId ? [requesterId, userId] : [userId, requesterId];

    const friendship = await prisma.friendship.findUnique({
      where: {
        userAId_userBId: {
          userAId,
          userBId,
        },
      },
    });

    if (!friendship) {
      return NextResponse.json(
        { error: "You can only add friends to a group" },
        { status: 403 },
      );
    }

    try {
      await prisma.groupMember.create({
        data: {
          groupId,
          userId,
          role: "MEMBER",
        },
      });
    } catch (error: any) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "User is already a member of this group" },
          { status: 400 },
        );
      }
      throw error;
    }

    return NextResponse.json(
      { message: "Member added successfully" },
      { status: 201 },
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
