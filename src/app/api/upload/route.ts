import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create target directory based on type
    const uploadDir = path.join(process.cwd(), "public", "uploads", type === "gym" ? "gyms" : "users");
    
    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const uniqueSuffix = crypto.randomBytes(8).toString("hex");
    const extension = path.extname(file.name) || (file.type === "image/png" ? ".png" : ".jpg");
    const userId = (session.user as any).id;
    const filename = `${userId}-${uniqueSuffix}${extension}`;
    const filePath = path.join(uploadDir, filename);

    // Write file
    await fs.writeFile(filePath, buffer);

    // Return the public URL
    const url = `/uploads/${type === "gym" ? "gyms" : "users"}/${filename}`;
    
    return NextResponse.json({ url });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
