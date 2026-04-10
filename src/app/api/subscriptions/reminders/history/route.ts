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

    const logs = await prisma.notificationLog.findMany({
      where: { gymId },
      include: {
        user: { select: { name: true, email: true, profilePhoto: true } },
      },
      orderBy: { sentAt: "desc" },
    });

    return NextResponse.json({ data: logs });
  } catch (error: any) {
    console.error("Fetch notification history error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
