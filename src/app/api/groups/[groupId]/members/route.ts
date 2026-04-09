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
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }

    if (userId === requesterId) {
      return NextResponse.json(
        { error: "Cannot invite yourself" },
        { status: 400 },
      );
    }

    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: requesterId,
        },
      },
    });

    if (!membership || membership.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only owners can invite" },
        { status: 403 },
      );
    }

    const existingMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a member of this group" },
        { status: 400 },
      );
    }

    try {
      const invite = await prisma.groupInvite.create({
        data: {
          groupId,
          inviterId: requesterId,
          receiverId: userId,
        },
      });

      return NextResponse.json({ invite }, { status: 201 });
    } catch (error: any) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Invite already sent to this user" },
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
