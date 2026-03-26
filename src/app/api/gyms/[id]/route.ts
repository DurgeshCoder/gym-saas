import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const gym = await prisma.gym.findUnique({
      where: { id },
      select: { id: true, name: true, logo: true, address: true, createdAt: true },
    });

    if (!gym) {
      return NextResponse.json({ message: "Gym not found" }, { status: 404 });
    }

    return NextResponse.json(gym);
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
