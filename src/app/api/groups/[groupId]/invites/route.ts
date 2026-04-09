import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invites = await prisma.groupInvite.findMany({
    where: {
      receiverId: userId,
    },
    include: {
      group: true,
      inviter: {
        select: { username: true },
      },
    },
  });

  return NextResponse.json(invites);
}
