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

    const { gymId } = session.user as any;
    if (!gymId) {
      return NextResponse.json({ data: [], page: 1, limit: 10, total: 0, totalPages: 0 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const methodFilter = searchParams.get("paymentMethod") || "";
    const statusFilter = searchParams.get("status") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

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
    if (methodFilter) where.paymentMethod = methodFilter;
    if (statusFilter) where.status = statusFilter;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          user: { select: { name: true, email: true, profilePhoto: true } },
          subscription: {
            include: {
              plan: { select: { name: true } },
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ]);

    const formattedPayments = payments.map((payment: any) => {
      if (payment.user?.profilePhoto) {
        payment.user.profilePhoto = getFileUrl(payment.user.profilePhoto);
      }
      return payment;
    });

    return NextResponse.json({
      data: formattedPayments,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("Fetch payments error:", error);
    return NextResponse.json({ message: "Error fetching payments" }, { status: 500 });
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

    const { userId, amount, paymentMethod, subscriptionId, notes } = await req.json();

    if (!userId || !amount || !paymentMethod) {
      return NextResponse.json({ message: "User, amount and method are required" }, { status: 400 });
    }

    // Verify user belongs to this gym
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.gymId !== gymId) {
      return NextResponse.json({ message: "User not found in your gym" }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the payment record
      const payment = await tx.payment.create({
        data: {
          amount: parseFloat(amount),
          paymentMethod,
          status: "SUCCESS", // Manual entry by owner is successful
          userId,
          subscriptionId,
          gymId,
        },
      });

      // 2. If it's linked to a subscription, extend it
      if (subscriptionId) {
        const sub = await tx.subscription.findUnique({
          where: { id: subscriptionId },
          include: { plan: true },
        });

        if (sub && sub.gymId === gymId) {
          // Calculate new end date: old end date (or now if expired) + plan duration
          const currentEndDate = new Date(sub.endDate);
          const now = new Date();
          const baseDate = currentEndDate > now ? currentEndDate : now;

          const newEndDate = new Date(baseDate);
          newEndDate.setDate(newEndDate.getDate() + sub.plan.duration);

          await tx.subscription.update({
            where: { id: subscriptionId },
            data: {
              endDate: newEndDate,
              active: true, // Reactivate if it was expired
            },
          });
        }
      }

      return payment;
    });

    return NextResponse.json({ message: "Payment recorded and subscription extended", payment: result }, { status: 201 });
  } catch (error: any) {
    console.error("Create payment error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
