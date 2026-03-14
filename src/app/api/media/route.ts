import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.title || !body.type) {
      return NextResponse.json(
        { error: "Title and type are required" },
        { status: 400 },
      );
    }

    const media = await prisma.media.create({
      data: {
        title: body.title,
        type: body.type,
      },
    });

    return NextResponse.json(media, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get("search");

    if (!search || search.length < 2) {
      return NextResponse.json([]);
    }

    const media = await prisma.media.findMany({
      where: {
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
      take: 10,
    });

    return NextResponse.json(media);
  } catch {
    return NextResponse.json(
      { error: "Failed to search media" },
      { status: 500 },
    );
  }
}
