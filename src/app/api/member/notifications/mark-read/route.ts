import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: userId } = session.user as any;
    const { notificationIds } = await req.json();

    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return NextResponse.json({ message: "No notification IDs provided" }, { status: 400 });
    }

    await prisma.notificationLog.updateMany({
      where: { 
        id: { in: notificationIds },
        userId // Ensure safety
      },
      data: { isRead: true },
    });

    return NextResponse.json({ message: "Marked as read successfully" });
  } catch (error: any) {
    console.error("Mark notifications read error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
