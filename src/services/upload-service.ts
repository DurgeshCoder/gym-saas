import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export interface UploadProvider {
  upload(file: File, type: "gym" | "user", userId: string): Promise<string>;
}

export class LocalUploadProvider implements UploadProvider {
  async upload(file: File, type: "gym" | "user", userId: string): Promise<string> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create target directory based on type
    const uploadDir = path.join(process.cwd(), "public", "uploads", type === "gym" ? "gyms" : "users");

    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const uniqueSuffix = crypto.randomBytes(8).toString("hex");
    const extension = path.extname(file.name) || (file.type === "image/png" ? ".png" : ".jpg");
    const filename = `${userId}-${uniqueSuffix}${extension}`;
    const filePath = path.join(uploadDir, filename);

    // Write file
    await fs.writeFile(filePath, buffer);

    // Return the public URL
    return `/uploads/${type === "gym" ? "gyms" : "users"}/${filename}`;
  }
}

export class ImageKitProvider implements UploadProvider {
  private publicKey: string;
  private privateKey: string;
  private urlEndpoint: string;

  constructor() {
    this.publicKey = process.env.IMAGEKIT_PUBLIC_KEY || "";
    this.privateKey = process.env.IMAGEKIT_PRIVATE_KEY || "";
    this.urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || "";
  }

  async upload(file: File, type: "gym" | "user", userId: string): Promise<string> {
    if (!this.privateKey) {
      throw new Error("ImageKit missing credentials. IMAGEKIT_PRIVATE_KEY is required.");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64File = buffer.toString("base64");
    
    // Generate unique filename
    const uniqueSuffix = crypto.randomBytes(8).toString("hex");
    const extension = path.extname(file.name) || (file.type === "image/png" ? ".png" : ".jpg");
    const filename = `${userId}-${uniqueSuffix}${extension}`;
    
    const folder = `/gym-saas/${type === "gym" ? "gyms" : "users"}`;

    const formData = new FormData();
    formData.append("file", base64File);
    formData.append("fileName", filename);
    formData.append("folder", folder);

    const authHeader = `Basic ` + Buffer.from(`${this.privateKey}:`).toString("base64");

    const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
      method: "POST",
      headers: {
        Authorization: authHeader,
      },
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("ImageKit upload error:", errorText);
      throw new Error(`ImageKit upload failed: ${res.statusText}`);
    }

    const data = await res.json();
    return data.url;
  }
}

export class UploadService {
  private provider: UploadProvider;

  constructor(provider: UploadProvider) {
    this.provider = provider;
  }

  async upload(file: File, type: "gym" | "user", userId: string): Promise<string> {
    return this.provider.upload(file, type, userId);
  }
}

// Automatically choose ImageKit if configured, otherwise fallback to local upload
export const uploadService = new UploadService(
  process.env.IMAGEKIT_PRIVATE_KEY ? new ImageKitProvider() : new LocalUploadProvider()
);
