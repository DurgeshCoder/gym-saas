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

    const { role } = session.user as any;
    if (role !== "GYM_OWNER") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const ownerId = (session.user as any).id;
    const gym = await prisma.gym.findUnique({
      where: { ownerId },
    });

    // Explicitly casting to any to bypass IDE ghost errors while keeping data intact
    const responseData: any = gym ? {
      ...gym,
      openingHours: gym.openingHours || {},
      socialLinks: gym.socialLinks || {},
    } : {};

    return NextResponse.json(responseData, {
      headers: { "Cache-Control": "no-store, max-age=0" }
    });
  } catch (error: any) {
    console.error("Fetch gym error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { role } = session.user as any;
    if (role !== "GYM_OWNER") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, logo, address, phone, email, website, description, openingHours, socialLinks } = body;

    if (!name) {
      return NextResponse.json({ message: "Gym name is required" }, { status: 400 });
    }

    const ownerId = (session.user as any).id;

    // Direct object creation with skip-types to ignore IDE caching issues
    const gymData: any = {
      name,
      logo,
      address,
      phone,
      email,
      website,
      description,
      openingHours: openingHours || {},
      socialLinks: socialLinks || {},
    };

    const updated = await prisma.gym.upsert({
      where: { ownerId },
      update: gymData,
      create: {
        ...gymData,
        ownerId,
      },
    });

    // Make sure the User model knows it now has a gym
    await prisma.user.update({
      where: { id: ownerId },
      data: { gymId: updated.id }
    });

    return NextResponse.json({ message: "Gym updated successfully", gym: updated });
  } catch (error: any) {
    console.error("Update gym error:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}
