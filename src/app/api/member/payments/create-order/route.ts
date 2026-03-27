import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { role, id: userId } = session.user as any;
    if (role !== "MEMBER") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { amount, subscriptionId } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ message: "Invalid amount" }, { status: 400 });
    }

    // Get the user's gym to fetch Razorpay credentials
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { gym: true }
    });

    const gym: any = user?.gym;
    if (!gym || !gym.razorpayKeyId || !gym.razorpayKeySecret) {
      return NextResponse.json({ message: "Gym Razorpay configuration not found" }, { status: 400 });
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: gym.razorpayKeyId,
      key_secret: gym.razorpayKeySecret,
    });

    const options = {
      amount: Math.round(amount * 100), // amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return NextResponse.json({ message: "Failed to create Razorpay order" }, { status: 500 });
    }

    // Return the required information to the frontend
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: gym.razorpayKeyId,
      gymName: gym.name,
      gymLogo: gym.logo,
      userName: user?.name,
      userEmail: user?.email,
      userPhone: (user as any)?.phone || "0000000000"
    });
  } catch (error) {
    console.error("Razorpay create order error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
