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

    const { role, gymId } = session.user as any;
    if (role !== "GYM_OWNER") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    if (!gymId) {
      return NextResponse.json({ message: "Gym not set up" }, { status: 400 });
    }

    const { filter, title, message } = await req.json();

    if (!title || !message) {
      return NextResponse.json({ message: "Title and message are required" }, { status: 400 });
    }

    // Determine the users to broadcast to based on the filter
    let userFilter: any = { gymId, role: "MEMBER" };
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    if (filter === "active") {
      userFilter.subscriptions = {
        some: { active: true, endDate: { gte: now } }
      };
    } else if (filter === "inactive") {
      userFilter.subscriptions = {
        none: { active: true, endDate: { gte: now } }
      };
    } else if (filter === "expiring_soon") {
      userFilter.subscriptions = {
        some: { active: true, endDate: { gte: now, lte: nextWeek } }
      };
    }

    const targetUsers = await prisma.user.findMany({
      where: userFilter,
      select: { id: true }
    });

    if (targetUsers.length === 0) {
      return NextResponse.json({ message: "No members matched the filter criteria" }, { status: 400 });
    }

    // Map to Notifications
    const notificationData = targetUsers.map((user) => ({
      gymId,
      userId: user.id,
      channel: "IN_APP" as const,
      title,
      message,
      isRead: false,
    }));

    await prisma.notificationLog.createMany({
      data: notificationData,
    });

    return NextResponse.json({ message: `Successfully broadcasted to ${targetUsers.length} member(s).` }, { status: 201 });
  } catch (error: any) {
    console.error("Broadcast broadcast error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { role, gymId } = session.user as any;
    if (role !== "GYM_OWNER") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    if (!gymId) {
      return NextResponse.json({ message: "Gym not set up" }, { status: 400 });
    }

    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "5", 10);
    const skip = (page - 1) * limit;

    const whereClause: any = { gymId, channel: "IN_APP" };
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Since Prisma groupBy doesn't easily return a total count of grouped rows,
    // we do an extra grouping query to count the length of grouped items for total pages.
    const countGroups = await prisma.notificationLog.groupBy({
      by: ['title', 'message', 'channel'],
      where: whereClause,
    });
    const totalCount = countGroups.length;

    const broadcasts = await prisma.notificationLog.groupBy({
      by: ['title', 'message', 'channel'],
      where: whereClause,
      _count: { userId: true },
      _max: { sentAt: true },
      orderBy: { _max: { sentAt: 'desc' } },
      skip,
      take: limit
    });

    return NextResponse.json({ 
      data: broadcasts, 
      pagination: { totalCount, page, limit, totalPages: Math.ceil(totalCount / limit) } 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Fetch broadcast history error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
