import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
