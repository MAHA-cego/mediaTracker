import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const requestId = body.requestId;

    if (!requestId) {
      return NextResponse.json(
        { error: "requestId is required" },
        { status: 400 },
      );
    }

    const request = await prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return NextResponse.json(
        { error: "Friend request not found" },
        { status: 404 },
      );
    }

    if (request.receiverId !== userId) {
      return NextResponse.json(
        { error: "Not authorized to accept this request" },
        { status: 403 },
      );
    }

    const [userAId, userBId] =
      request.requesterId < request.receiverId
        ? [request.requesterId, request.receiverId]
        : [request.receiverId, request.requesterId];

    try {
      const friendship = await prisma.$transaction(async (tx) => {
        const existing = await tx.friendship.findUnique({
          where: { userAId_userBId: { userAId, userBId } },
        });

        if (existing) {
          throw Object.assign(new Error("Already friends"), { status: 409 });
        }

        const created = await tx.friendship.create({
          data: { userAId, userBId },
        });

        await tx.friendRequest.delete({ where: { id: requestId } });

        return created;
      });

      return NextResponse.json(friendship);
    } catch (error: any) {
      if (error.status === 409) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      console.error(error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
