import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { cacheGet, cacheSet, CacheKey } from "@/lib/cache";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const key = CacheKey.userFriendRequests(userId);
    const cached = await cacheGet<unknown[]>(key);
    if (cached) return NextResponse.json(cached);

    const requests = await prisma.friendRequest.findMany({
      where: { receiverId: userId },
      include: {
        requester: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    await cacheSet(key, requests, 60);
    return NextResponse.json(requests);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
