import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  const skip = (page - 1) * limit;

  // Build WHERE clause
  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { address: { contains: search } },
      { owner: { name: { contains: search } } },
      { owner: { email: { contains: search } } },
    ];
  }

  // Build ORDER BY
  const orderBy: any = {};
  if (sortBy === "name") orderBy.name = sortOrder;
  else if (sortBy === "updatedAt") orderBy.updatedAt = sortOrder;
  else orderBy.createdAt = sortOrder;

  const [gyms, total] = await Promise.all([
    prisma.gym.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { users: true } },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.gym.count({ where }),
  ]);

  return NextResponse.json(
    {
      data: gyms,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    { status: 200 }
  );
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { name, ownerName, ownerEmail, ownerPassword } = await req.json();

    if (!name || !ownerName || !ownerEmail || !ownerPassword) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: ownerEmail } });
    if (existingUser) {
      return NextResponse.json({ message: "Email already registered for another user" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(ownerPassword, 12);

    const gym = await prisma.$transaction(async (tx) => {
      const owner = await tx.user.create({
        data: {
          name: ownerName,
          email: ownerEmail,
          password: hashedPassword,
          role: "GYM_OWNER",
        },
      });

      const newGym = await tx.gym.create({
        data: {
          name,
          ownerId: owner.id,
        },
      });

      await tx.user.update({
        where: { id: owner.id },
        data: { gymId: newGym.id },
      });

      return newGym;
    });

    return NextResponse.json({ message: "Gym and Owner created successfully", gym }, { status: 201 });
  } catch (error: any) {
    console.error("Super Admin create gym error:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}
