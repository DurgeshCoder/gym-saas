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
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/* ─── Types ─── */

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
  [day: string]: DayHours | HoursType; // day entries + 'type' key
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

const defaultDayHours: DayHours = { closed: false, open: "06:00", close: "22:00", shifts: [{ name: "Morning", open: "06:00", close: "12:00" }, { name: "Evening", open: "16:00", close: "22:00" }] };

const buildDefaultHours = (): OpeningHoursData => {
  const hours: any = { type: "full_day" as HoursType };
  DAYS.forEach(day => {
    hours[day] = { ...defaultDayHours, shifts: defaultDayHours.shifts.map(s => ({ ...s })) };
  });
  return hours;
};

const defaultSocials = { instagram: "", facebook: "", twitter: "", youtube: "" };

/* ─── Migrate old format to new ─── */
function migrateOpeningHours(raw: any): OpeningHoursData {
  if (!raw || typeof raw !== "object") return buildDefaultHours();

  // Already new format
  if (raw.type === "full_day" || raw.type === "shifts") {
    // Ensure every day has the shifts array
    DAYS.forEach(day => {
      if (raw[day]) {
        if (!raw[day].shifts) raw[day].shifts = [{ name: "Morning", open: "06:00", close: "12:00" }, { name: "Evening", open: "16:00", close: "22:00" }];
      } else {
        raw[day] = { ...defaultDayHours, shifts: defaultDayHours.shifts.map(s => ({ ...s })) };
      }
    });
    return raw as OpeningHoursData;
  }

  // Old format: { Monday: { open, close, closed }, ... }
  const migrated: any = { type: "full_day" as HoursType };
  DAYS.forEach(day => {
    const old = raw[day];
    migrated[day] = {
      closed: old?.closed ?? false,
      open: old?.open ?? "06:00",
      close: old?.close ?? "22:00",
      shifts: [{ name: "Morning", open: "06:00", close: "12:00" }, { name: "Evening", open: "16:00", close: "22:00" }],
    };
  });
  return migrated as OpeningHoursData;
}

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
    setFormData(prev => ({
      ...prev,
      openingHours: { ...prev.openingHours, type },
    }));
  };

  const updateDayHours = (day: string, patch: Partial<DayHours>) => {
    setFormData(prev => ({
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
    if (dh.shifts.length <= 1) return; // keep at least 1
    const newShifts = dh.shifts.filter((_, i) => i !== idx);
    updateDayHours(day, { shifts: newShifts });
  };

  const updateShift = (day: string, idx: number, patch: Partial<Shift>) => {
    const dh = getDayHours(day);
    const newShifts = dh.shifts.map((s, i) => (i === idx ? { ...s, ...patch } : s));
    updateDayHours(day, { shifts: newShifts });
  };

  const updateSocial = (platform: keyof GymSettings["socialLinks"], value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value },
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
                Operating Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mode Switcher */}
              <div className="flex rounded-lg border border-border overflow-hidden">
                <button
                  type="button"
                  onClick={() => setHoursType("full_day")}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold uppercase tracking-wide transition-all ${
                    hoursType === "full_day"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  Full Day
                </button>
                <button
                  type="button"
                  onClick={() => setHoursType("shifts")}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold uppercase tracking-wide transition-all ${
                    hoursType === "shifts"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Sunrise className="w-3.5 h-3.5" />
                  Shift Wise
                </button>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {hoursType === "full_day"
                  ? "Set a single opening & closing time for each day."
                  : "Add multiple shifts per day (e.g. Morning, Evening)."}
              </p>

              {/* Day Rows */}
              <div className="space-y-3">
                {DAYS.map(day => {
                  const dh = getDayHours(day);
                  return (
                    <div
                      key={day}
                      className={`p-3 rounded-lg border transition-colors ${
                        dh.closed
                          ? "bg-muted/30 border-border/50"
                          : "bg-muted/50 border-border"
                      }`}
                    >
                      {/* Day Header */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          {day}
                        </span>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={dh.closed}
                            onChange={(e) => updateDayHours(day, { closed: e.target.checked })}
                            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                          />
                          <span className="text-[10px] font-bold uppercase text-muted-foreground">Closed</span>
                        </label>
                      </div>

                      {/* Content when open */}
                      {!dh.closed && (
                        <>
                          {hoursType === "full_day" ? (
                            /* ── Full Day Mode ── */
                            <div className="flex items-center gap-2">
                              <Input
                                type="time"
                                value={dh.open}
                                onChange={(e) => updateDayHours(day, { open: e.target.value })}
                                className="text-xs h-8"
                              />
                              <span className="text-muted-foreground font-bold px-1">→</span>
                              <Input
                                type="time"
                                value={dh.close}
                                onChange={(e) => updateDayHours(day, { close: e.target.value })}
                                className="text-xs h-8"
                              />
                            </div>
                          ) : (
                            /* ── Shift Mode ── */
                            <div className="space-y-2">
                              {dh.shifts.map((shift, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-1.5 bg-background/60 border border-border/60 rounded-md p-2"
                                >
                                  <Input
                                    type="text"
                                    value={shift.name}
                                    onChange={(e) => updateShift(day, idx, { name: e.target.value })}
                                    placeholder="Shift name"
                                    className="text-xs h-7 w-[90px] min-w-0 flex-shrink-0"
                                  />
                                  <Input
                                    type="time"
                                    value={shift.open}
                                    onChange={(e) => updateShift(day, idx, { open: e.target.value })}
                                    className="text-xs h-7 min-w-0"
                                  />
                                  <span className="text-muted-foreground text-[10px]">→</span>
                                  <Input
                                    type="time"
                                    value={shift.close}
                                    onChange={(e) => updateShift(day, idx, { close: e.target.value })}
                                    className="text-xs h-7 min-w-0"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeShift(day, idx)}
                                    disabled={dh.shifts.length <= 1}
                                    className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                                    title="Remove shift"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => addShift(day)}
                                className="flex items-center gap-1.5 text-[10px] font-semibold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider pt-0.5"
                              >
                                <Plus className="w-3 h-3" />
                                Add Shift
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
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
