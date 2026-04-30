import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cacheGet, cacheSet, cacheDel, bumpNamespaceVersion, CacheKey } from "@/lib/cache";
import { enqueue } from "@/lib/queue";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ groupId: string }> },
) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { groupId } = await context.params;

    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    type CachedGroup = {
      id: string;
      name: string;
      createdAt: string;
      members: { id: string; username: string; role: string }[];
    };

    const cacheKey = CacheKey.groupDetails(groupId);
    const cached = await cacheGet<CachedGroup>(cacheKey);

    if (cached) {
      return NextResponse.json({ ...cached, role: membership.role });
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: { select: { id: true, username: true } },
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const groupData: CachedGroup = {
      id: group.id,
      name: group.name,
      createdAt: group.createdAt.toISOString(),
      members: group.members.map((m) => ({
        id: m.user.id,
        username: m.user.username,
        role: m.role,
      })),
    };

    await cacheSet(cacheKey, groupData, 120);
    return NextResponse.json({ ...groupData, role: membership.role });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ groupId: string }> },
) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { groupId } = await context.params;

    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (!membership || membership.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only owners can delete the group" },
        { status: 403 },
      );
    }

    const members = await prisma.groupMember.findMany({
      where: { groupId },
      select: { userId: true },
    });

    await prisma.group.delete({ where: { id: groupId } });

    const memberIds = members.map((m) => m.userId);
    await Promise.all([
      cacheDel(
        CacheKey.groupDetails(groupId),
        ...memberIds.map(CacheKey.userGroups),
      ),
      bumpNamespaceVersion(CacheKey.groupMediaNs(groupId)),
    ]);
    enqueue({ type: "GROUP_DELETED", groupId, memberIds });

    return NextResponse.json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
