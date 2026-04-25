import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getFileUrl } from "@/services/upload-service";

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

    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const where: any = { gymId, channel: { not: "IN_APP" } };
    
    if (search) {
      where.OR = [
        { message: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [logs, totalCount] = await Promise.all([
      prisma.notificationLog.findMany({
        where,
        include: {
          user: { select: { name: true, email: true, profilePhoto: true } },
        },
        orderBy: { sentAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notificationLog.count({ where })
    ]);

    const formattedLogs = logs.map((log: any) => {
      if (log.user?.profilePhoto) {
        log.user.profilePhoto = getFileUrl(log.user.profilePhoto);
      }
      return log;
    });

    return NextResponse.json({ 
      data: formattedLogs,
      pagination: { totalCount, page, limit, totalPages: Math.ceil(totalCount / limit) }
    });
  } catch (error: any) {
    console.error("Fetch notification history error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
