"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Settings,
  Image as ImageIcon,
  MapPin,
  Phone,
  Globe,
  Save,
  Loader2,
  Building2,
  CheckCircle2,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GymSettings {
  name: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  openingHours: Record<string, { open: string; close: string; closed: boolean }>;
  socialLinks: {
    instagram: string;
    facebook: string;
    twitter: string;
    youtube: string;
  };
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const defaultHours = DAYS.reduce((acc, day) => ({
  ...acc,
  [day]: { open: "06:00", close: "22:00", closed: false }
}), {});

const defaultSocials = { instagram: "", facebook: "", twitter: "", youtube: "" };

export default function OwnerSettingsPage() {
  const { update } = useSession();
  const [formData, setFormData] = useState<GymSettings>({
    name: "",
    logo: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    description: "",
    openingHours: defaultHours,
    socialLinks: defaultSocials,
    razorpayKeyId: "",
    razorpayKeySecret: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/owner/gym", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data && Object.keys(data).length > 0) {
          setFormData({
            name: data.name || "",
            logo: data.logo || "",
            address: data.address || "",
            phone: data.phone || "",
            email: data.email || "",
            website: data.website || "",
            description: data.description || "",
            openingHours: data.openingHours || defaultHours,
            socialLinks: data.socialLinks || defaultSocials,
            razorpayKeyId: data.razorpayKeyId || "",
            razorpayKeySecret: data.razorpayKeySecret || "",
          });
        }
      }
    } catch (err) {
      toast.error("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/owner/gym", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const body = await res.json();
        toast.success("Gym profile updated successfully!");
        await fetchSettings();
        await update({ gymId: body.gym.id });
        setTimeout(() => window.location.reload(), 500);
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to update profile.");
      }
    } catch {
      toast.error("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const updateHour = (day: string, field: "open" | "close" | "closed", value: any) => {
    setFormData(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: { ...prev.openingHours[day], [field]: value }
      }
    }));
  };

  const updateSocial = (platform: keyof GymSettings["socialLinks"], value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value }
    }));
  };

  const labelCls = "block text-sm font-medium text-foreground mb-1.5";

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* ── Header ── */}
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Gym Profile</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Institutional information and operating schedules.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-8">
            {/* ── General Information ── */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building2 className="w-5 h-5 text-primary" />
                  General Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col gap-6">
                  <div>
                    <label className={labelCls}>Gym Name</label>
                    <Input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="My Fitness Center"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Logo URL</label>
                    <div className="flex gap-4 items-center">
                      <Input
                        type="text"
                        value={formData.logo}
                        onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                        placeholder="https://imgur.com/logo.png"
                      />
                      <div className="w-14 h-14 min-w-14 rounded-lg bg-muted border border-border flex items-center justify-center overflow-hidden">
                        {formData.logo ? (
                          <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Official Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="min-h-[120px] resize-none"
                    placeholder="Describe what makes your gym special..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* ── Contact Details ── */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Phone className="w-5 h-5 text-primary" />
                  Contact & Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className={labelCls}>Physical Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="pl-10"
                      placeholder="Street No, Building, City"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Support Phone</label>
                    <Input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Support Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Website</label>
                    <Input
                      type="text"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ── Social Media ── */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Globe className="w-5 h-5 text-primary" />
                  Social Media
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {["instagram", "facebook", "twitter", "youtube"].map((platform) => (
                    <div key={platform}>
                      <label className={labelCls}>{platform.charAt(0).toUpperCase() + platform.slice(1)}</label>
                      <Input
                        type="text"
                        value={formData.socialLinks[platform as keyof GymSettings["socialLinks"]]}
                        onChange={(e) => updateSocial(platform as keyof GymSettings["socialLinks"], e.target.value)}
                        placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ── Payment Gateway ── */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings className="w-5 h-5 text-primary" />
                  Payment Gateway (Razorpay)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelCls}>Key ID</label>
                    <Input
                      type="text"
                      value={formData.razorpayKeyId}
                      onChange={(e) => setFormData({ ...formData, razorpayKeyId: e.target.value })}
                      placeholder="rzp_test_..."
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Key Secret</label>
                    <Input
                      type="password"
                      value={formData.razorpayKeySecret}
                      onChange={(e) => setFormData({ ...formData, razorpayKeySecret: e.target.value })}
                      placeholder="Enter secret key"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Opening Hours (Right Column) ── */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="w-5 h-5 text-primary" />
                Opening Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {DAYS.map(day => (
                  <div key={day} className="p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{day}</span>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.openingHours[day]?.closed}
                          onChange={(e) => updateHour(day, "closed", e.target.checked)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">Closed</span>
                      </label>
                    </div>
                    {!formData.openingHours[day]?.closed && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={formData.openingHours[day]?.open}
                          onChange={(e) => updateHour(day, "open", e.target.value)}
                          className="text-xs h-8"
                        />
                        <span className="text-muted-foreground font-bold px-1">→</span>
                        <Input
                          type="time"
                          value={formData.openingHours[day]?.close}
                          onChange={(e) => updateHour(day, "close", e.target.value)}
                          className="text-xs h-8"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Sticky Action Bar ── */}
        <div className="sticky bottom-8 z-20 p-6 rounded-lg bg-card border border-border flex flex-col sm:flex-row items-center justify-between shadow-lg gap-4">
          <div>
            <p className="font-bold text-lg flex items-center gap-2 text-foreground">
              <CheckCircle2 className="w-5 h-5 text-primary" /> Ready to Update?
            </p>
            <p className="text-muted-foreground text-xs font-medium">Changes propagate across the system instantly</p>
          </div>
          <Button type="submit" disabled={saving} size="lg" className="w-full sm:w-auto gap-2">
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Confirm Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
