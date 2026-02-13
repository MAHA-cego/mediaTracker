import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function GET() {
  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.email || !body.username || !body.password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const user = await prisma.user.create({
      data: {
        email: body.email,
        username: body.username,
        passwordHash: hashedPassword,
      },
    });

    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      { status: 201 },
    );
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Email or username already exists" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
