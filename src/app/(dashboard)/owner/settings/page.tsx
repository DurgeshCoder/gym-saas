/* Gym Owner Settings — v2 */
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
  Plus,
  Trash2,
  Sun,
  Sunrise,
  Mail,
  Link2,
  CreditCard,
  Shield,
  Eye,
  EyeOff,
  Info,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

/* ─────────────────────────────────────────────
   Types
   ───────────────────────────────────────────── */

interface Shift {
  name: string;
  open: string;
  close: string;
}

interface DayHours {
  closed: boolean;
  open: string;
  close: string;
  shifts: Shift[];
}

type HoursType = "full_day" | "shifts";

interface OpeningHoursData {
  type: HoursType;
  [day: string]: DayHours | HoursType;
}

interface GymSettings {
  name: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  openingHours: OpeningHoursData;
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
const DAY_SHORT: Record<string, string> = { Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu", Friday: "Fri", Saturday: "Sat", Sunday: "Sun" };

const defaultDayHours: DayHours = {
  closed: false,
  open: "06:00",
  close: "22:00",
  shifts: [
    { name: "Morning", open: "06:00", close: "12:00" },
    { name: "Evening", open: "16:00", close: "22:00" },
  ],
};

const buildDefaultHours = (): OpeningHoursData => {
  const hours: any = { type: "full_day" as HoursType };
  DAYS.forEach((day) => {
    hours[day] = { ...defaultDayHours, shifts: defaultDayHours.shifts.map((s) => ({ ...s })) };
  });
  return hours;
};

const defaultSocials = { instagram: "", facebook: "", twitter: "", youtube: "" };

/* ─── Migrate legacy format ─── */
function migrateOpeningHours(raw: any): OpeningHoursData {
  if (!raw || typeof raw !== "object") return buildDefaultHours();

  if (raw.type === "full_day" || raw.type === "shifts") {
    DAYS.forEach((day) => {
      if (raw[day]) {
        if (!raw[day].shifts)
          raw[day].shifts = [
            { name: "Morning", open: "06:00", close: "12:00" },
            { name: "Evening", open: "16:00", close: "22:00" },
          ];
      } else {
        raw[day] = { ...defaultDayHours, shifts: defaultDayHours.shifts.map((s) => ({ ...s })) };
      }
    });
    return raw as OpeningHoursData;
  }

  const migrated: any = { type: "full_day" as HoursType };
  DAYS.forEach((day) => {
    const old = raw[day];
    migrated[day] = {
      closed: old?.closed ?? false,
      open: old?.open ?? "06:00",
      close: old?.close ?? "22:00",
      shifts: [
        { name: "Morning", open: "06:00", close: "12:00" },
        { name: "Evening", open: "16:00", close: "22:00" },
      ],
    };
  });
  return migrated as OpeningHoursData;
}

/* ─── Social icon + color map ─── */
const SOCIAL_INITIALS: Record<string, string> = {
  instagram: "Ig",
  facebook: "Fb",
  twitter: "X",
  youtube: "Yt",
};

const SOCIAL_COLORS: Record<string, string> = {
  instagram: "from-pink-500 to-purple-500",
  facebook: "from-blue-600 to-blue-500",
  twitter: "from-neutral-800 to-neutral-700 dark:from-neutral-200 dark:to-neutral-300",
  youtube: "from-red-600 to-red-500",
};

/* ═══════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════ */

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
    openingHours: buildDefaultHours(),
    socialLinks: defaultSocials,
    razorpayKeyId: "",
    razorpayKeySecret: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  /* ─── Fetch ─── */
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
            openingHours: migrateOpeningHours(data.openingHours),
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

  /* ─── Save ─── */
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

  /* ─── Hours helpers ─── */
  const getDayHours = (day: string): DayHours => formData.openingHours[day] as DayHours;
  const hoursType = formData.openingHours.type as HoursType;

  const setHoursType = (type: HoursType) => {
    setFormData((prev) => ({
      ...prev,
      openingHours: { ...prev.openingHours, type },
    }));
  };

  const updateDayHours = (day: string, patch: Partial<DayHours>) => {
    setFormData((prev) => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: { ...(prev.openingHours[day] as DayHours), ...patch },
      },
    }));
  };

  const addShift = (day: string) => {
    const dh = getDayHours(day);
    const newShifts = [...dh.shifts, { name: `Shift ${dh.shifts.length + 1}`, open: "09:00", close: "17:00" }];
    updateDayHours(day, { shifts: newShifts });
  };

  const removeShift = (day: string, idx: number) => {
    const dh = getDayHours(day);
    if (dh.shifts.length <= 1) return;
    const newShifts = dh.shifts.filter((_, i) => i !== idx);
    updateDayHours(day, { shifts: newShifts });
  };

  const updateShift = (day: string, idx: number, patch: Partial<Shift>) => {
    const dh = getDayHours(day);
    const newShifts = dh.shifts.map((s, i) => (i === idx ? { ...s, ...patch } : s));
    updateDayHours(day, { shifts: newShifts });
  };

  const updateSocial = (platform: keyof GymSettings["socialLinks"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value },
    }));
  };

  /* ─── Convenience ─── */
  const openDaysCount = DAYS.filter((d) => !(getDayHours(d).closed)).length;

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Settings className="w-7 h-7 text-primary animate-spin" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">Loading settings</p>
            <p className="text-xs text-muted-foreground mt-0.5">Preparing your gym profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-28">
      {/* ═══ Page Header ═══ */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-linear-to-br from-card via-card to-muted/30 p-6 sm:p-8">
        {/* Decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-primary/5" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-primary/5" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
            <Settings className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Gym Settings
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-lg">
              Configure your gym profile, contact details, operating hours, and payment integrations—all in one place.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs">
              <Sparkles className="w-3 h-3" />
              {openDaysCount}/7 days open
            </Badge>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* ═══ Tabs ═══ */}
        <Tabs defaultValue="general" onValueChange={(val) => setActiveTab(val as string)}>
          <TabsList className="w-full justify-start gap-0 overflow-x-auto" variant="line">
            <TabsTrigger value="general" className="gap-1.5">
              <Building2 className="w-4 h-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="contact" className="gap-1.5">
              <Phone className="w-4 h-4" />
              Contact
            </TabsTrigger>
            <TabsTrigger value="social" className="gap-1.5">
              <Globe className="w-4 h-4" />
              Social
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-1.5">
              <CreditCard className="w-4 h-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="hours" className="gap-1.5">
              <Clock className="w-4 h-4" />
              Hours
            </TabsTrigger>
          </TabsList>

          {/* ─── TAB: General ─── */}
          <TabsContent value="general">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              {/* Left: Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-4.5 h-4.5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">General Information</CardTitle>
                        <CardDescription>Basic details about your gym that members see first.</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1.5">
                        Gym Name <span className="text-destructive">*</span>
                      </label>
                      <Input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. FitZone Elite Gym"
                        className="h-11"
                      />
                      <p className="text-[11px] text-muted-foreground mt-1.5">
                        This name will be displayed across your branded pages.
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1.5">Logo URL</label>
                      <div className="flex gap-4 items-start">
                        <Input
                          type="text"
                          value={formData.logo}
                          onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                          placeholder="https://your-cdn.com/logo.png"
                          className="h-11 flex-1"
                        />
                        <div className="w-16 h-16 rounded-xl bg-muted/50 border-2 border-dashed border-border flex items-center justify-center overflow-hidden shrink-0 transition-all hover:border-primary/40">
                          {formData.logo ? (
                            <img src={formData.logo} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1.5">
                        Paste a direct image URL. Recommended size: 256×256px or higher.
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1.5">
                        Description
                      </label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="min-h-[140px] resize-none"
                        placeholder="Tell members what makes your gym unique—equipment, trainers, atmosphere..."
                      />
                      <p className="text-[11px] text-muted-foreground mt-1.5">
                        {formData.description.length}/500 characters
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right: Preview */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">
                      Profile Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="w-20 h-20 rounded-2xl bg-muted/50 border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                        {formData.logo ? (
                          <img src={formData.logo} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <Building2 className="w-8 h-8 text-muted-foreground/40" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">
                          {formData.name || "Your Gym Name"}
                        </h3>
                        {formData.address && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {formData.address}
                          </p>
                        )}
                      </div>
                      {formData.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                          {formData.description}
                        </p>
                      )}
                      <Separator />
                      <div className="grid grid-cols-2 gap-3 w-full">
                        <div className="p-2.5 rounded-lg bg-muted/50 text-center">
                          <p className="text-lg font-bold text-foreground">{openDaysCount}</p>
                          <p className="text-[10px] text-muted-foreground font-medium uppercase">Open Days</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-muted/50 text-center">
                          <p className="text-lg font-bold text-foreground capitalize">
                            {hoursType === "full_day" ? "Full" : "Shifts"}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-medium uppercase">Schedule</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ─── TAB: Contact ─── */}
          <TabsContent value="contact">
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                      <Phone className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Contact & Location</CardTitle>
                      <CardDescription>
                        How members and visitors can reach or find your gym.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Address */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">
                      Physical Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="pl-10 h-11"
                        placeholder="123 Main Street, Floor 2, New York, NY 10001"
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Contact rows */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1.5">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="text"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="pl-10 h-11"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1.5">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="pl-10 h-11"
                          placeholder="hello@yourgym.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1.5">Website</label>
                      <div className="relative">
                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="text"
                          value={formData.website}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          className="pl-10 h-11"
                          placeholder="https://yourgym.com"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ─── TAB: Social ─── */}
          <TabsContent value="social">
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center">
                      <Globe className="w-4.5 h-4.5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Social Media Links</CardTitle>
                      <CardDescription>
                        Connect your social profiles so members can follow you everywhere.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {(["instagram", "facebook", "twitter", "youtube"] as const).map((platform) => (
                      <div key={platform} className="group">
                        <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-1.5">
                          <span className={`w-6 h-6 rounded-md bg-linear-to-br ${SOCIAL_COLORS[platform]} flex items-center justify-center text-white text-[10px] font-black`}>
                            {SOCIAL_INITIALS[platform]}
                          </span>
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </label>
                        <Input
                          type="text"
                          value={formData.socialLinks[platform]}
                          onChange={(e) => updateSocial(platform, e.target.value)}
                          placeholder={`https://${platform}.com/yourgym`}
                          className="h-11"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ─── TAB: Payments ─── */}
          <TabsContent value="payments">
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
                      <CreditCard className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Payment Gateway — Razorpay</CardTitle>
                      <CardDescription>
                        Enable online fee collection by connecting your Razorpay account.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Security notice */}
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20">
                    <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Sensitive Credentials</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        Your Razorpay keys are stored securely and used only for payment processing. Never share your secret key publicly.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1.5">
                        API Key ID
                      </label>
                      <Input
                        type="text"
                        value={formData.razorpayKeyId}
                        onChange={(e) => setFormData({ ...formData, razorpayKeyId: e.target.value })}
                        placeholder="rzp_live_xxxxxxxxxxxxxx"
                        className="h-11 font-mono text-sm"
                      />
                      <p className="text-[11px] text-muted-foreground mt-1.5">
                        Found in Razorpay Dashboard → Settings → API Keys
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1.5">
                        API Key Secret
                      </label>
                      <div className="relative">
                        <Input
                          type={showSecret ? "text" : "password"}
                          value={formData.razorpayKeySecret}
                          onChange={(e) => setFormData({ ...formData, razorpayKeySecret: e.target.value })}
                          placeholder="••••••••••••••••"
                          className="h-11 font-mono text-sm pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecret(!showSecret)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1.5">
                        This key is hidden after save. Regenerate from Razorpay dashboard if lost.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ─── TAB: Hours ─── */}
          <TabsContent value="hours">
            <div className="mt-6 space-y-6">
              {/* Mode selector card */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-9 h-9 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center">
                        <Clock className="w-4.5 h-4.5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Operating Hours</CardTitle>
                        <CardDescription>
                          Choose how to define your gym&apos;s daily schedule.
                        </CardDescription>
                      </div>
                    </div>

                    {/* Mode toggle */}
                    <div className="flex rounded-xl border border-border p-1 bg-muted/30 sm:ml-auto">
                      <button
                        type="button"
                        onClick={() => setHoursType("full_day")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                          hoursType === "full_day"
                            ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Sun className="w-3.5 h-3.5" />
                        Full Day
                      </button>
                      <button
                        type="button"
                        onClick={() => setHoursType("shifts")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                          hoursType === "shifts"
                            ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Sunrise className="w-3.5 h-3.5" />
                        Shift Wise
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Info banner */}
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/40 border border-border/60 mb-6">
                    <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {hoursType === "full_day"
                        ? "Full Day mode sets one continuous operating window per day. Best for gyms that stay open without breaks."
                        : "Shift-wise mode lets you define multiple time blocks per day—ideal for gyms with morning and evening batches."}
                    </p>
                  </div>

                  {/* Weekly schedule */}
                  <div className="space-y-3">
                    {DAYS.map((day, dayIdx) => {
                      const dh = getDayHours(day);
                      const isWeekend = day === "Saturday" || day === "Sunday";

                      return (
                        <div
                          key={day}
                          className={`group/day rounded-xl border transition-all ${
                            dh.closed
                              ? "bg-muted/20 border-border/40 opacity-60"
                              : "bg-card border-border hover:shadow-sm"
                          }`}
                        >
                          <div className="flex items-center gap-3 p-3.5 sm:p-4">
                            {/* Day indicator */}
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-xs font-black uppercase ${
                              dh.closed
                                ? "bg-muted text-muted-foreground"
                                : isWeekend
                                  ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                                  : "bg-primary/10 text-primary"
                            }`}>
                              {DAY_SHORT[day]}
                            </div>

                            {/* Day name + status */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-foreground">{day}</span>
                                {dh.closed ? (
                                  <Badge variant="secondary" className="text-[10px] px-2 py-0">Closed</Badge>
                                ) : hoursType === "full_day" ? (
                                  <span className="text-[11px] text-muted-foreground font-medium hidden sm:inline">
                                    {dh.open} – {dh.close}
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-muted-foreground font-medium hidden sm:inline">
                                    {dh.shifts.length} shift{dh.shifts.length !== 1 ? "s" : ""}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Closed toggle */}
                            <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                              <input
                                type="checkbox"
                                checked={!dh.closed}
                                onChange={(e) => updateDayHours(day, { closed: !e.target.checked })}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full after:shadow-sm" />
                              <span className="ml-2 text-[10px] font-bold uppercase text-muted-foreground hidden sm:inline">
                                {dh.closed ? "Off" : "On"}
                              </span>
                            </label>
                          </div>

                          {/* Expanded content */}
                          {!dh.closed && (
                            <div className="px-3.5 sm:px-4 pb-3.5 sm:pb-4 pt-0">
                              <div className="border-t border-border/50 pt-3">
                                {hoursType === "full_day" ? (
                                  /* ── Full Day ── */
                                  <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                      <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1 tracking-wider">Opens</label>
                                      <Input
                                        type="time"
                                        value={dh.open}
                                        onChange={(e) => updateDayHours(day, { open: e.target.value })}
                                        className="text-sm h-9"
                                      />
                                    </div>
                                    <div className="pt-5">
                                      <span className="text-muted-foreground text-lg">→</span>
                                    </div>
                                    <div className="flex-1">
                                      <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1 tracking-wider">Closes</label>
                                      <Input
                                        type="time"
                                        value={dh.close}
                                        onChange={(e) => updateDayHours(day, { close: e.target.value })}
                                        className="text-sm h-9"
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  /* ── Shifts ── */
                                  <div className="space-y-2.5">
                                    {dh.shifts.map((shift, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30 border border-border/50"
                                      >
                                        <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                                        <Input
                                          type="text"
                                          value={shift.name}
                                          onChange={(e) => updateShift(day, idx, { name: e.target.value })}
                                          placeholder="Shift name"
                                          className="text-xs h-8 w-24 sm:w-28 min-w-0 shrink-0 font-medium"
                                        />
                                        <Input
                                          type="time"
                                          value={shift.open}
                                          onChange={(e) => updateShift(day, idx, { open: e.target.value })}
                                          className="text-xs h-8 min-w-0 flex-1"
                                        />
                                        <span className="text-muted-foreground text-[10px] shrink-0">→</span>
                                        <Input
                                          type="time"
                                          value={shift.close}
                                          onChange={(e) => updateShift(day, idx, { close: e.target.value })}
                                          className="text-xs h-8 min-w-0 flex-1"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => removeShift(day, idx)}
                                          disabled={dh.shifts.length <= 1}
                                          className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-20 disabled:cursor-not-allowed shrink-0"
                                          title="Remove shift"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ))}
                                    <button
                                      type="button"
                                      onClick={() => addShift(day)}
                                      className="flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors pt-1"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      Add another shift
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* ═══ Sticky Save Bar ═══ */}
        <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
          <div className="max-w-5xl mx-auto px-4 sm:px-8 pb-6">
            <div className="pointer-events-auto p-4 sm:p-5 rounded-2xl glass border border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-black/5 dark:shadow-black/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">Ready to save?</p>
                  <p className="text-xs text-muted-foreground">Changes will be applied immediately across the platform.</p>
                </div>
              </div>
              <Button type="submit" disabled={saving} size="lg" className="w-full sm:w-auto gap-2 shadow-sm">
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save All Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
