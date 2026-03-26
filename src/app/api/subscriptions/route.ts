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

    const { gymId } = session.user as any;
    if (!gymId) {
      return NextResponse.json({ data: [], page: 1, limit: 10, total: 0, totalPages: 0 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const statusFilter = searchParams.get("status") || "";
    const planFilter = searchParams.get("planId") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    const where: any = { gymId };

    if (search) {
      where.user = {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
        ],
      };
    }
    if (statusFilter === "active") where.active = true;
    if (statusFilter === "expired") where.active = false;
    if (planFilter) where.planId = planFilter;

    const orderBy: any = {};
    if (sortBy === "startDate") orderBy.startDate = sortOrder;
    else if (sortBy === "endDate") orderBy.endDate = sortOrder;
    else orderBy.createdAt = sortOrder;

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          plan: { select: { id: true, name: true, price: true, duration: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.subscription.count({ where }),
    ]);

    return NextResponse.json({ data: subscriptions, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (error: any) {
    console.error("Fetch subscriptions error:", error);
    return NextResponse.json({ message: "Error fetching subscriptions" }, { status: 500 });
  }
}

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

    const { userId, planId, startDate, autoRenew, paymentMethod } = await req.json();

    if (!userId || !planId || !startDate) {
      return NextResponse.json({ message: "Member, plan, and start date are required" }, { status: 400 });
    }

    // Verify user belongs to this gym
    const member = await prisma.user.findUnique({ where: { id: userId } });
    if (!member || member.gymId !== gymId) {
      return NextResponse.json({ message: "Member not found in your gym" }, { status: 404 });
    }

    // Verify plan belongs to this gym
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || plan.gymId !== gymId) {
      return NextResponse.json({ message: "Plan not found in your gym" }, { status: 404 });
    }

    // Check for existing active subscription for this user
    const existingActive = await prisma.subscription.findFirst({
      where: { userId, gymId, active: true },
    });
    if (existingActive) {
      return NextResponse.json(
        { message: "This member already has an active subscription. Deactivate it first." },
        { status: 400 }
      );
    }

    // Calculate end date
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + plan.duration);

    // Create subscription + payment in transaction
    const result = await prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.create({
        data: {
          userId,
          planId,
          gymId,
          startDate: start,
          endDate: end,
          autoRenew: autoRenew || false,
          active: true,
        },
      });

      // Auto-create a payment record
      const payment = await tx.payment.create({
        data: {
          amount: plan.price,
          paymentMethod: paymentMethod || "CASH",
          status: "SUCCESS",
          userId,
          subscriptionId: subscription.id,
          gymId,
        },
      });

      return { subscription, payment };
    });

    return NextResponse.json(
      { message: "Subscription created successfully", ...result },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create subscription error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
