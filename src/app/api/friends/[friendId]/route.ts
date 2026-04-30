import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { cacheDel, CacheKey } from "@/lib/cache";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ friendId: string }> },
) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { friendId } = await context.params;

    const [userAId, userBId] =
      userId < friendId ? [userId, friendId] : [friendId, userId];

    const friendship = await prisma.friendship.findUnique({
      where: { userAId_userBId: { userAId, userBId } },
    });

    if (!friendship) {
      return NextResponse.json({ error: "Friendship not found" }, { status: 404 });
    }

    await prisma.friendship.delete({
      where: { userAId_userBId: { userAId, userBId } },
    });

    await cacheDel(CacheKey.userFriends(userId), CacheKey.userFriends(friendId));

    return NextResponse.json({ message: "Removed" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
