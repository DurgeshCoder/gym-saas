import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { role, gymId } = session.user as any;
    if (role !== "GYM_OWNER") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { name, price, duration } = await req.json();

    // Verify plan belongs to this gym
    const existingPlan = await prisma.plan.findUnique({ where: { id } });
    if (!existingPlan || existingPlan.gymId !== gymId) {
      return NextResponse.json({ message: "Plan not found in your gym" }, { status: 404 });
    }

    if (!name || price == null || duration == null) {
      return NextResponse.json({ message: "Name, price, and duration are required" }, { status: 400 });
    }

    const plan = await prisma.plan.update({
      where: { id },
      data: { name, price: parseFloat(price), duration: parseInt(duration) },
    });

    return NextResponse.json({ message: "Plan updated", plan });
  } catch (error: any) {
    console.error("Update plan error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { role, gymId } = session.user as any;
    if (role !== "GYM_OWNER") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const existingPlan = await prisma.plan.findUnique({ where: { id } });
    if (!existingPlan || existingPlan.gymId !== gymId) {
      return NextResponse.json({ message: "Plan not found in your gym" }, { status: 404 });
    }

    // Check if there are active subscriptions on this plan
    const activeSubs = await prisma.subscription.count({
      where: { planId: id, active: true },
    });

    if (activeSubs > 0) {
      return NextResponse.json(
        { message: `Cannot delete: ${activeSubs} active subscription(s) are using this plan` },
        { status: 400 }
      );
    }

    await prisma.plan.delete({ where: { id } });

    return NextResponse.json({ message: "Plan deleted" });
  } catch (error: any) {
    console.error("Delete plan error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
