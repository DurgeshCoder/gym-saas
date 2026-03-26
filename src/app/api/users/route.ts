import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { role: currentUserRole, gymId } = session.user as any;

    if (currentUserRole !== "GYM_OWNER" && currentUserRole !== "SUPER_ADMIN") {
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

    // Role safety check
    if (!["TRAINER", "MEMBER"].includes(role)) {
      return NextResponse.json({ message: "Invalid role assigned" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: "Email is already registered" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        gymId,
        active: true,
      },
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

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { role: currentUserRole, gymId } = session.user as any;
    if (!gymId) return NextResponse.json([], { status: 200 });

    const { searchParams } = new URL(req.url);
    const filterRole = searchParams.get("role");
    
    const whereClause: any = { gymId, id: { not: (session.user as any).id } };
    if (filterRole) whereClause.role = filterRole;

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Error fetching users" }, { status: 500 });
  }
}
