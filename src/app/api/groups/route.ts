import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { cacheGet, cacheSet, cacheDel, CacheKey } from "@/lib/cache";
import { enqueue } from "@/lib/queue";

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Invalid group name" },
        { status: 400 },
      );
    }

    const trimmedName = name.trim();

    const group = await prisma.group.create({
      data: {
        name: trimmedName,
        createdById: userId,
        members: {
          create: {
            userId,
            role: "OWNER",
          },
        },
      },
    });

    await cacheDel(CacheKey.userGroups(userId));
    enqueue({ type: "GROUP_CREATED", groupId: group.id, creatorId: userId });

    return NextResponse.json(group, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "You already have a group with this name" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create group" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const key = CacheKey.userGroups(userId);
    const cached = await cacheGet<unknown[]>(key);
    if (cached) return NextResponse.json(cached);

    const memberships = await prisma.groupMember.findMany({
      where: { userId },
      include: {
        group: {
          include: { _count: { select: { members: true } } },
        },
      },
    });

    const groups = memberships.map((m) => ({
      ...m.group,
      memberCount: m.group._count.members,
    }));

    await cacheSet(key, groups, 120);
    return NextResponse.json(groups);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 },
    );
  }
}
