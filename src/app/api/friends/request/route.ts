import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const receiverId = body.receiverId;

    if (!receiverId) {
      return NextResponse.json(
        { error: "ReceiverId is required" },
        { status: 400 },
      );
    }

    if (receiverId === userId) {
      return NextResponse.json(
        { error: "Cannot send friend request to yourself" },
        { status: 400 },
      );
    }

    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userAId: userId, userBId: receiverId },
          { userAId: receiverId, userBId: userId },
        ],
      },
    });

    if (existingFriendship) {
      return NextResponse.json({ error: "Already friends" }, { status: 400 });
    }

    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { requesterId: userId, receiverId },
          { requesterId: receiverId, receiverId: userId },
        ],
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: "Friend request already exists" },
        { status: 409 },
      );
    }

    const request = await prisma.friendRequest.create({
      data: {
        requesterId: userId,
        receiverId,
      },
    });

    return NextResponse.json(request, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
