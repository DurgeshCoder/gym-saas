import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { planSchema } from "@/lib/schemas/plan";

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
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    const skip = (page - 1) * limit;

    const where: any = { gymId };

    if (search) {
      where.name = { contains: search };
    }
    if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice) };
    if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice) };

    const orderBy: any = {};
    if (sortBy === "name") orderBy.name = sortOrder;
    else if (sortBy === "price") orderBy.price = sortOrder;
    else if (sortBy === "duration") orderBy.duration = sortOrder;
    else orderBy.createdAt = sortOrder;

    const [plans, total] = await Promise.all([
      prisma.plan.findMany({
        where,
        include: {
          _count: { select: { subscriptions: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.plan.count({ where }),
    ]);

    return NextResponse.json({ data: plans, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (error: any) {
    return NextResponse.json({ message: "Error fetching plans" }, { status: 500 });
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

    const body = await req.json();
    const result = planSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ message: "Invalid input", errors: result.error.issues }, { status: 400 });
    }

    const { name, price, duration, discount, discountType } = result.data;

    const plan = await prisma.plan.create({
      data: { name, price, duration, discount, discountType, gymId },
    });

    return NextResponse.json({ message: "Plan created", plan }, { status: 201 });
  } catch (error: any) {
    console.error("Create plan error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
