import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { role: currentUserRole, gymId } = session.user as any;

    if (!gymId) {
      return NextResponse.json({ data: [], page: 1, limit: 10, total: 0, totalPages: 0 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const roleFilter = searchParams.get("role") || "";
    const statusFilter = searchParams.get("status") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Build WHERE clause — always scope to gymId and exclude self
    const where: any = {
      gymId,
      id: { not: (session.user as any).id },
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }
    if (roleFilter) where.role = roleFilter;
    if (statusFilter === "active") where.active = true;
    if (statusFilter === "inactive") where.active = false;

    // Build ORDER BY
    const orderBy: any = {};
    if (sortBy === "name") orderBy.name = sortOrder;
    else if (sortBy === "email") orderBy.email = sortOrder;
    else if (sortBy === "role") orderBy.role = sortOrder;
    else orderBy.createdAt = sortOrder;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          profilePhoto: true,
          active: true,
          createdAt: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({ data: users, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (error: any) {
    return NextResponse.json({ message: "Error fetching users" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { role: currentUserRole, gymId } = session.user as any;

    if (currentUserRole !== "GYM_OWNER") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (!gymId) {
      return NextResponse.json({ message: "Gym not set up yet" }, { status: 400 });
    }

    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    if (!["TRAINER", "MEMBER"].includes(role)) {
      return NextResponse.json({ message: "Invalid role. Only TRAINER or MEMBER allowed." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "Email is already registered" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword, role, gymId, active: true },
    });

    return NextResponse.json(
      { message: "User added successfully", user: { id: newUser.id, name: newUser.name, role: newUser.role } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Add user error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
