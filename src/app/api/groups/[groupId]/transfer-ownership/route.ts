import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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
    const { userId: newOwnerId } = body;

    if (!newOwnerId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const currentMembership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (!currentMembership || currentMembership.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only owners can transfer ownership" },
        { status: 403 },
      );
    }

    const targetMembership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: newOwnerId,
        },
      },
    });

    if (!targetMembership) {
      return NextResponse.json(
        { error: "User is not a member of this group" },
        { status: 400 },
      );
    }

    await prisma.$transaction([
      prisma.groupMember.update({
        where: {
          groupId_userId: {
            groupId,
            userId: newOwnerId,
          },
        },
        data: { role: "OWNER" },
      }),

      prisma.groupMember.update({
        where: {
          groupId_userId: {
            groupId,
            userId,
          },
        },
        data: { role: "MEMBER" },
      }),
    ]);

    return NextResponse.json({ message: "Ownership transferred" });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
