import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadService, getFileUrl } from "@/services/upload-service";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as "gym" | "user";

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }
    
    if (file.size > 100 * 1024) {
      return NextResponse.json({ message: "Image must be less than 100KB" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ message: "File must be an image" }, { status: 400 });
    }

    const validTypes = ["gym", "user"];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json({ message: "Invalid upload type" }, { status: 400 });
    }

    const userId = (session.user as any).id;
    const key = await uploadService.upload(file, type, userId);
    console.log(key);

    if (type === "user") {
      await prisma.user.update({
        where: { id: userId },
        data: { profilePhoto: key }
      });
    } else if (type === "gym") {
      const existingGym = await prisma.gym.findUnique({ where: { ownerId: userId } });
      if (existingGym) {
        await prisma.gym.update({
          where: { ownerId: userId },
          data: { logo: key }
        });
      }
    }
    
    return NextResponse.json({ url: getFileUrl(key) });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
