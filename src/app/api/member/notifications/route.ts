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

    const { id: userId } = session.user as any;
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const filter = url.searchParams.get("filter") || "all"; // all, unread, read
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const where: any = { userId, channel: "IN_APP" };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (filter === "unread") where.isRead = false;
    if (filter === "read") where.isRead = true;

    const [notifications, totalCount, unreadCount] = await Promise.all([
      prisma.notificationLog.findMany({
        where,
        orderBy: { sentAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notificationLog.count({ where }),
      prisma.notificationLog.count({ where: { userId, channel: "IN_APP", isRead: false } })
    ]);

    return NextResponse.json({ 
      data: notifications, 
      unreadCount,
      pagination: { totalCount, page, limit, totalPages: Math.ceil(totalCount / limit) }
    });
  } catch (error: any) {
    console.error("Fetch notifications error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
