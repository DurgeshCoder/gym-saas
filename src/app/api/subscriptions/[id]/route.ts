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
    const { planId, startDate, autoRenew, active } = await req.json();

    // Verify subscription belongs to this gym
    const sub = await prisma.subscription.findUnique({ where: { id } });
    if (!sub || sub.gymId !== gymId) {
      return NextResponse.json({ message: "Subscription not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (typeof autoRenew === "boolean") updateData.autoRenew = autoRenew;
    if (typeof active === "boolean") updateData.active = active;

    // If plan is changed or start date is changed, recalculate endDate
    if (planId || startDate) {
      const newPlanId = planId || sub.planId;
      const plan = await prisma.plan.findUnique({ where: { id: newPlanId } });
      if (!plan || plan.gymId !== gymId) {
        return NextResponse.json({ message: "Plan not found" }, { status: 404 });
      }

      const start = startDate ? new Date(startDate) : sub.startDate;
      const end = new Date(start);
      end.setDate(end.getDate() + plan.duration);

      updateData.planId = newPlanId;
      updateData.startDate = start;
      updateData.endDate = end;
    }

    const updated = await prisma.subscription.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ message: "Subscription updated", subscription: updated });
  } catch (error: any) {
    console.error("Update subscription error:", error);
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

    const sub = await prisma.subscription.findUnique({ where: { id } });
    if (!sub || sub.gymId !== gymId) {
      return NextResponse.json({ message: "Subscription not found" }, { status: 404 });
    }

    // Soft cancel: set active=false
    await prisma.subscription.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({ message: "Subscription cancelled" });
  } catch (error: any) {
    console.error("Cancel subscription error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
