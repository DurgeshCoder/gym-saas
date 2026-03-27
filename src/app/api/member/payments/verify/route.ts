import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, amount, subscriptionId } = body;
    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { gym: true }
    });

    const gym: any = user?.gym;
    if (!gym || !gym.razorpayKeySecret) {
      return NextResponse.json({ message: "Gym configuration error" }, { status: 400 });
    }

    // Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", gym.razorpayKeySecret)
      .update(razorpayOrderId + "|" + razorpayPaymentId)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return NextResponse.json({ message: "Invalid payment signature" }, { status: 400 });
    }

    // Record the payment
    const payment = await prisma.payment.create({
      data: {
        amount: Number(amount),
        paymentMethod: "RAZORPAY" as any,
        status: "SUCCESS",
        userId: userId,
        gymId: gym.id,
        subscriptionId: subscriptionId || null,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      } as any
    });

    // Extend the subscription if a subscriptionId is provided
    if (subscriptionId) {
      const subscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
        include: { plan: true },
      });

      if (subscription && subscription.plan) {
        const currentDate = new Date();
        const durationInDays = subscription.plan.duration;
        let newEndDate: Date;

        // If the current end date is in the future, add to it
        // If it's already expired, start from today
        if (subscription.endDate > currentDate) {
          newEndDate = new Date(subscription.endDate);
          newEndDate.setDate(newEndDate.getDate() + durationInDays);
        } else {
          newEndDate = new Date();
          newEndDate.setDate(currentDate.getDate() + durationInDays);
        }

        await prisma.subscription.update({
          where: { id: subscriptionId },
          data: {
            endDate: newEndDate,
            active: true,
          },
        });
      }
    }

    return NextResponse.json({ message: "Payment verified successfully", payment });
  } catch (error) {
    console.error("Razorpay verify payment error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
