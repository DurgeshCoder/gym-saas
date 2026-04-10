"use client";

import { useState, useEffect } from "react";
import { User, Image as ImageIcon, Save } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useSession } from "next-auth/react";

export default function MemberProfilePage() {
  const { update } = useSession();
  const [formData, setFormData] = useState({ name: "", email: "", profilePhoto: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetch("/api/member/profile")
      .then(res => res.json())
      .then(json => {
        if (json.data) {
          setFormData({
            name: json.data.name || "",
            email: json.data.email || "",
            profilePhoto: json.data.profilePhoto || ""
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024) {
      toast.error("Image size must be strictly less than 100KB.");
      return;
    }

    const isSquare = await new Promise<boolean>((resolve) => {
      const img = new globalThis.Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => resolve(img.width === img.height);
    });

    if (!isSquare) {
      toast.error("Image must be a perfect square (1:1 ratio). Please crop it first.");
      return;
    }

    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", "user");

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, profilePhoto: data.url }));
        toast.success("Profile photo uploaded!");
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to upload image.");
      }
    } catch {
      toast.error("Error connecting to upload service.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/member/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, profilePhoto: formData.profilePhoto }),
      });
      if (res.ok) {
        toast.success("Profile updated seamlessly!");
        const json = await res.json();
        await update({ name: json.data.name, picture: json.data.profilePhoto });
      } else {
        toast.error("Failed to update profile.");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 border-b pb-6">
        <User className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-extrabold">My Profile</h1>
      </div>

      <form onSubmit={handleSave}>
        <Card>
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
            <CardDescription>Manage your photo and display name.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Profile Photo</label>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="w-20 h-20 rounded-full bg-muted/50 border-2 border-dashed border-border flex items-center justify-center overflow-hidden shrink-0">
                  {formData.profilePhoto ? (
                    <img src={formData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <label className="relative cursor-pointer w-full inline-flex items-center justify-center px-4 py-2 border border-border shadow-sm text-sm font-medium rounded-md text-foreground bg-secondary hover:bg-secondary/80 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary transition-colors">
                    <span>{uploadingImage ? "Uploading..." : "Upload New Photo"}</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploadingImage || saving}
                    />
                  </label>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                Must be a perfect square, &lt; 100KB, max 500x500px.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Display Name</label>
                <Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email Address</label>
                <Input value={formData.email} disabled className="bg-muted" />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={saving} className="gap-2">
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </div>
            
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
