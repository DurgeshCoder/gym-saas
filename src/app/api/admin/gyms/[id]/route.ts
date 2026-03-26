import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { name, address, logo, active } = await req.json();
    const { id } = await params;

    if (!name) {
      return NextResponse.json({ message: "Gym name is required" }, { status: 400 });
    }

    const updatedGym = await prisma.gym.update({
      where: { id },
      data: {
        name,
        address,
        logo,
      },
    });

    return NextResponse.json({ message: "Gym updated successfully", gym: updatedGym }, { status: 200 });
  } catch (error: any) {
    console.error("Super Admin update gym error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    await prisma.$transaction([
      prisma.user.updateMany({ where: { gymId: id }, data: { gymId: null, role: "MEMBER" } }),
      prisma.gym.delete({ where: { id } })
    ]);

    return NextResponse.json({ message: "Gym deleted" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Error deleting gym" }, { status: 500 });
  }
}
