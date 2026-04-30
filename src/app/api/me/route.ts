import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cacheGet, cacheSet, CacheKey } from "@/lib/cache";

export async function GET(req: Request) {
  const userId = req.headers.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const key = CacheKey.userProfile(userId);
  const cached = await cacheGet<{ id: string; email: string; username: string }>(key);
  if (cached) return NextResponse.json(cached);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, username: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await cacheSet(key, user, 300);
  return NextResponse.json(user);
}
