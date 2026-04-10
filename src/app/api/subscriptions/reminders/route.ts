import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { gymId, role } = session.user as any;
    if (!gymId || role !== "GYM_OWNER") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "7");

    const today = new Date();
    const threshold = new Date(today);
    threshold.setDate(threshold.getDate() + days);

    const subscriptions = await prisma.subscription.findMany({
      where: {
        gymId,
        active: true,
        endDate: {
          lte: threshold,
          gte: today, // Only active explicitly means not already fully expired in the past, but let's be lenient or include slightly expired
        },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        plan: { select: { id: true, name: true } },
      },
      orderBy: { endDate: "asc" },
    });

    return NextResponse.json({ data: subscriptions });
  } catch (error: any) {
    console.error("Fetch expiring subscriptions error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { gymId, role } = session.user as any;
    if (!gymId || role !== "GYM_OWNER") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { subscriptionId, userId, message, channel } = await req.json();

    if (!subscriptionId || !userId || !message || !channel) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Record the notification log
    const log = await prisma.notificationLog.create({
      data: {
        gymId,
        userId,
        subscriptionId,
        channel,
        message,
      },
    });

    return NextResponse.json({ message: "Reminder sent successfully", log }, { status: 201 });
  } catch (error: any) {
    console.error("Send reminder error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
