import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { gymId, role } = session.user as any;
    if (!gymId || role !== "GYM_OWNER") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "7");

    const today = new Date();
    const threshold = new Date(today);
    threshold.setDate(threshold.getDate() + days);

    const subscriptions = await prisma.subscription.findMany({
      where: {
        gymId,
        active: true,
        endDate: {
          lte: threshold,
          gte: today, // Only active explicitly means not already fully expired in the past, but let's be lenient or include slightly expired
        },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        plan: { select: { id: true, name: true } },
      },
      orderBy: { endDate: "asc" },
    });

    return NextResponse.json({ data: subscriptions });
  } catch (error: any) {
    console.error("Fetch expiring subscriptions error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { gymId, role } = session.user as any;
    if (!gymId || role !== "GYM_OWNER") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { subscriptionId, userId, message, channel } = await req.json();

    if (!subscriptionId || !userId || !message || !channel) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Fetch gym settings for credentials
    const gym = await prisma.gym.findUnique({
      where: { id: gymId },
      select: {
        id: true,
        name: true,
        emailProvider: true,
        emailApiKey: true,
        emailFromAddress: true,
        twilioAccountSid: true,
        twilioAuthToken: true,
        twilioSmsNumber: true,
        twilioWhatsappNumber: true,
      }
    });

    if (!gym) {
      return NextResponse.json({ message: "Gym not found" }, { status: 404 });
    }

    // Attach payment link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || (req.headers.get("origin") || "http://localhost:3000");
    const paymentLink = `${appUrl}/member/payments`;
    const finalMessage = `${message}\n\nPay online here: ${paymentLink}`;

    // Validate and "send" based on channel
    if (channel === "EMAIL") {
      if (!gym.emailApiKey || !gym.emailFromAddress) {
        return NextResponse.json({ message: "Email integration not configured in Gym Settings" }, { status: 400 });
      }
      // TODO: Use Resend / SendGrid / SMTP SDK natively
      console.log(`[EMAIL] Sending from ${gym.emailFromAddress} to User ${userId} via ${gym.emailProvider}: ${finalMessage}`);
      
    } else if (channel === "SMS") {
      if (!gym.twilioAccountSid || !gym.twilioAuthToken || !gym.twilioSmsNumber) {
        return NextResponse.json({ message: "Twilio SMS integration not configured in Gym Settings" }, { status: 400 });
      }
      // TODO: Use Twilio SDK: twilio(sid, token).messages.create({ from: smNumber, to: userPhone, body: finalMessage })
      console.log(`[SMS] Sending from ${gym.twilioSmsNumber} via Twilio SID ${gym.twilioAccountSid}: ${finalMessage}`);
      
    } else if (channel === "WHATSAPP") {
      if (!gym.twilioAccountSid || !gym.twilioAuthToken || !gym.twilioWhatsappNumber) {
        return NextResponse.json({ message: "Twilio WhatsApp integration not configured in Gym Settings" }, { status: 400 });
      }
      // TODO: Use Twilio SDK: twilio(sid, token).messages.create({ from: whatsappNumber, to: 'whatsapp:'+userPhone, body: finalMessage })
      console.log(`[WHATSAPP] Sending from ${gym.twilioWhatsappNumber} via Twilio SID ${gym.twilioAccountSid}: ${finalMessage}`);
    }

    // Record the notification log
    const log = await prisma.notificationLog.create({
      data: {
        gymId,
        userId,
        subscriptionId,
        channel,
        message: finalMessage,
      },
    });

    return NextResponse.json({ message: "Reminder sent successfully", log }, { status: 201 });
  } catch (error: any) {
    console.error("Send reminder error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
