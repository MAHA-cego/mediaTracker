import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { cacheGet, cacheSet, CacheKey } from "@/lib/cache";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const key = CacheKey.userFriends(userId);
    const cached = await cacheGet<unknown[]>(key);
    if (cached) return NextResponse.json(cached);

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
      },
      include: {
        userA: { select: { id: true, username: true, email: true } },
        userB: { select: { id: true, username: true, email: true } },
      },
    });

    const friends = friendships.map((f) =>
      f.userAId === userId ? f.userB : f.userA,
    );

    await cacheSet(key, friends, 120);
    return NextResponse.json(friends);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
