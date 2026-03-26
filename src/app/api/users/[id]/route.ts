import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { role: currentUserRole, gymId } = session.user as any;
    if (currentUserRole !== "GYM_OWNER") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { name, email, password, role, active } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ message: "Name and email are required" }, { status: 400 });
    }

    // Ensure this user belongs to the owner's gym
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser || targetUser.gymId !== gymId) {
      return NextResponse.json({ message: "User not found in your gym" }, { status: 404 });
    }

    // Check email uniqueness excluding current user
    const emailTaken = await prisma.user.findFirst({
      where: { email, id: { not: id } },
    });
    if (emailTaken) {
      return NextResponse.json({ message: "Email already used by another user" }, { status: 409 });
    }

    // Only allow TRAINER or MEMBER roles
    if (role && !["TRAINER", "MEMBER"].includes(role)) {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 });
    }

    const updateData: any = { name, email };
    if (role) updateData.role = role;
    if (typeof active === "boolean") updateData.active = active;

    if (password && password.trim().length > 0) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const user = await prisma.user.update({ where: { id }, data: updateData });

    return NextResponse.json({
      message: "User updated",
      user: { id: user.id, name: user.name, email: user.email, role: user.role, active: user.active },
    });
  } catch (error: any) {
    console.error("Update user error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { role: currentUserRole, gymId } = session.user as any;
    if (currentUserRole !== "GYM_OWNER") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Ensure this user belongs to the owner's gym
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser || targetUser.gymId !== gymId) {
      return NextResponse.json({ message: "User not found in your gym" }, { status: 404 });
    }

    // Deactivate instead of hard delete (audit-friendly per PRD)
    await prisma.user.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({ message: "User deactivated" });
  } catch (error: any) {
    console.error("Delete user error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
