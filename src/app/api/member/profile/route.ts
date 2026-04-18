import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getFileUrl, extractFileKey } from "@/services/upload-service";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, profilePhoto: true },
    });

    if (user && user.profilePhoto) {
      user.profilePhoto = getFileUrl(user.profilePhoto);
    }

    return NextResponse.json({ data: user });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;
    const body = await req.json();
    const { name, profilePhoto } = body;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { name, profilePhoto: extractFileKey(profilePhoto) },
      select: { name: true, email: true, profilePhoto: true }
    });

    if (updated.profilePhoto) {
      updated.profilePhoto = getFileUrl(updated.profilePhoto);
    }

    return NextResponse.json({ message: "Profile updated successfully!", data: updated });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
