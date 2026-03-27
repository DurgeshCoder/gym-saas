import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const body = JSON.parse(bodyText);

    // We only care about successful payment captures
    if (body.event !== "payment.captured") {
      return NextResponse.json({ message: "Event ignored" });
    }

    const paymentEntity = body.payload?.payment?.entity;
    if (!paymentEntity) {
      return NextResponse.json({ message: "No payment entity found" }, { status: 400 });
    }

    const razorpayPaymentId = paymentEntity.id;
    const razorpayOrderId = paymentEntity.order_id;
    const amount = paymentEntity.amount / 100; // Razorpay sends amount in paise
    const notes = paymentEntity.notes;

    if (!notes || !notes.gymId || !notes.userId) {
      return NextResponse.json({ message: "Missing metadata in notes" }, { status: 400 });
    }

    const { gymId, userId, subscriptionId } = notes;

    // 1. Check if we already processed this payment
    const existingPayment = await prisma.payment.findUnique({
      where: { razorpayPaymentId },
    });

    if (existingPayment) {
      return NextResponse.json({ message: "Payment already processed" });
    }

    // 2. Lookup the Gym to get its Razorpay credentials
    const gym: any = await prisma.gym.findUnique({
      where: { id: gymId }
    });

    if (!gym || !gym.razorpayKeyId || !gym.razorpayKeySecret) {
      console.error(`Gym ${gymId} not found or missing keys for Webhook`);
      return NextResponse.json({ message: "Configuration missing" }, { status: 400 });
    }

    // 3. SECURE VERIFICATION: Instead of relying purely on webhook signature (which requires a configured secret),
    // we query Razorpay directly with the Gym Admin's secrets to verify the payment is actually captured.
    const razorpay = new Razorpay({
      key_id: gym.razorpayKeyId,
      key_secret: gym.razorpayKeySecret,
    });

    const verifyRemotePayment = await razorpay.payments.fetch(razorpayPaymentId);
    
    // Check if the source-of-truth payment is truly captured and matches our expected order
    if (verifyRemotePayment.status !== "captured" || verifyRemotePayment.order_id !== razorpayOrderId) {
      console.error("Payment verification failed at source of truth via Webhook", razorpayPaymentId);
      return NextResponse.json({ message: "Verification failed" }, { status: 400 });
    }

    // 4. Create the payment record
    const payment = await prisma.payment.create({
      data: {
        amount: amount,
        paymentMethod: "RAZORPAY" as any,
        status: "SUCCESS",
        userId: userId,
        gymId: gymId,
        subscriptionId: subscriptionId || null,
        razorpayOrderId: razorpayOrderId,
        razorpayPaymentId: razorpayPaymentId,
        razorpaySignature: "WEBHOOK_VERIFIED", // We use direct-fetch rather than HMAC sign for webhook
      } as any
    });

    // 5. Extend the subscription
    if (subscriptionId) {
      const subscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
        include: { plan: true },
      });

      if (subscription && subscription.plan) {
        const currentDate = new Date();
        const durationInDays = subscription.plan.duration;
        let newEndDate: Date;

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

    console.log(`Webhook successfully processed payment ${razorpayPaymentId}`);
    return NextResponse.json({ message: "Webhook processed successfully", payment });
    
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ message: "Webhook server error" }, { status: 500 });
  }
}
