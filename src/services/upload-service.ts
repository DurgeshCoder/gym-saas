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

    // Return strictly the object key (relative path)
    return `uploads/${type === "gym" ? "gyms" : "users"}/${filename}`;
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

    const fileResponse= await res.json()
    console.log(fileResponse)

    // Return strictly the object key (relative path)
    return `gym-saas/${type === "gym" ? "gyms" : "users"}/${fileResponse.name}`;
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

export function getFileUrl(key: string | null | undefined): string {
  if (!key) return "";
  
  // Backward compatibility check for external URLs (like Google Auth avatars)
  if (key.startsWith("http") && !key.includes("imagekit.io")) return key; 
  if (key.startsWith("data:")) return key;

  // Ensure it's a raw relative key before deciding the domain
  const cleanKey = extractFileKey(key);

  if (cleanKey.startsWith("gym-saas/")) {
    const endpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/your_id";
    const cleanEndpoint = endpoint.endsWith('/') ? endpoint : `${endpoint}/`;
    return `${cleanEndpoint}${cleanKey}`;
  }
  
  if (cleanKey.startsWith("uploads/")) {
    return `/${cleanKey}`;
  }
  
  // Legacy short key format fallback (if they just look like `gyms/...`)
  if (!cleanKey.startsWith("/")) {
    return `/uploads/${cleanKey}`;
  }

  return cleanKey.startsWith("/") ? cleanKey : `/${cleanKey}`;
}

export function extractFileKey(url: string | null | undefined): string {
  if (!url) return "";

  if (url.includes("/gym-saas/")) {
    return "gym-saas/" + url.split("/gym-saas/")[1]; 
  }
  if (url.includes("/uploads/")) {
    return "uploads/" + url.split("/uploads/")[1];
  }

  return url;
}
