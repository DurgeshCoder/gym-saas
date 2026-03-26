"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Image as ImageIcon,
  MapPin,
  Phone,
  Globe,
  Mail,
  Info,
  Save,
  Loader2,
  Building2,
  CheckCircle2,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";

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
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const defaultHours = DAYS.reduce((acc, day) => ({
  ...acc,
  [day]: { open: "06:00", close: "22:00", closed: false }
}), {});

const defaultSocials = { instagram: "", facebook: "", twitter: "", youtube: "" };

export default function OwnerSettingsPage() {
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
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/owner/gym", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        console.log("[DEBUG] Fetched Gym Data:", data);
        
        // Populate if data exists
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
      console.log("[DEBUG] Saving Data:", formData);
      const res = await fetch("/api/owner/gym", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Gym profile updated successfully!");
        // Fetch again to stay on current state
        await fetchSettings();
        // Give 1s before reload for the toast to be seen and brand name to change globally
        setTimeout(() => window.location.reload(), 800);
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

  const inputCls =
    "w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400";
  const labelCls = "block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1";

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* ── Header ── */}
      <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
         <div className="absolute right-0 top-0 w-32 h-32 bg-blue-600/5 dark:bg-blue-600/10 rounded-bl-[10rem] transition-all group-hover:w-40 group-hover:h-40" />
         <div className="w-16 h-16 rounded-[2rem] bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/20 text-white transition-transform group-hover:scale-105">
           <Settings className="w-8 h-8" />
         </div>
         <div className="relative z-10">
           <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Gym Profile</h1>
           <p className="text-slate-500 font-medium text-sm mt-1">Institutional information and operating schedules.</p>
         </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            {/* ── General Information ── */}
            <div className="space-y-6 bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm">
               <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900 dark:text-white">General Information</h3>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelCls}>Gym Name</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={inputCls}
                      placeholder="My Fitness Center"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Logo URL</label>
                    <div className="flex gap-4 items-center">
                      <input
                        type="text"
                        value={formData.logo}
                        onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                        className={inputCls}
                        placeholder="https://imgur.com/logo.png"
                      />
                      <div className="w-14 h-14 min-w-[3.5rem] rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                        {formData.logo ? (
                          <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-slate-300" />
                        )}
                      </div>
                    </div>
                  </div>
               </div>

               <div>
                 <label className={labelCls}>Official Description</label>
                 <textarea
                   value={formData.description}
                   onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                   className={`${inputCls} min-h-[120px] resize-none`}
                   placeholder="Describe what makes your gym special..."
                 />
               </div>
            </div>

            {/* ── Contact Details ── */}
            <div className="space-y-6 bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm">
               <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 dark:text-white">Contact & Location</h3>
               </div>

               <div>
                 <label className={labelCls}>Physical Address</label>
                 <div className="relative">
                   <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                   <input
                     type="text"
                     value={formData.address}
                     onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                     className={`${inputCls} pl-12`}
                     placeholder="Street No, Building, City"
                   />
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Support Phone</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Support Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Website</label>
                    <input
                      type="text"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className={inputCls}
                    />
                  </div>
               </div>
            </div>

            {/* ── Social Media ── */}
            <div className="space-y-6 bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-5 h-5 text-purple-600" />
                    <h3 className="font-bold text-slate-900 dark:text-white">Social Media</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {["instagram", "facebook", "twitter", "youtube"].map((platform) => (
                      <div key={platform} className="relative">
                         <Globe className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                         <input
                           type="text"
                           value={formData.socialLinks[platform as keyof GymSettings["socialLinks"]]}
                           onChange={(e) => updateSocial(platform as keyof GymSettings["socialLinks"], e.target.value)}
                           className={`${inputCls} pl-12`}
                           placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
                         />
                      </div>
                   ))}
                </div>
            </div>
          </div>

          {/* ── Opening Hours (Right Column) ── */}
          <div className="space-y-6 bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm h-fit">
              <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-slate-900 dark:text-white">Opening Hours</h3>
              </div>
              
              <div className="space-y-4">
                 {DAYS.map(day => (
                   <div key={day} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                         <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{day}</span>
                         <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.openingHours[day]?.closed}
                              onChange={(e) => updateHour(day, "closed", e.target.checked)}
                              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-[10px] font-black uppercase text-slate-400">Closed</span>
                         </label>
                      </div>
                      {!formData.openingHours[day]?.closed && (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                           <input
                             type="time"
                             value={formData.openingHours[day]?.open}
                             onChange={(e) => updateHour(day, "open", e.target.value)}
                             className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-lg px-2 py-1.5 outline-none"
                           />
                           <span className="text-slate-300 font-bold px-1">→</span>
                           <input
                             type="time"
                             value={formData.openingHours[day]?.close}
                             onChange={(e) => updateHour(day, "close", e.target.value)}
                             className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-lg px-2 py-1.5 outline-none"
                           />
                        </div>
                      )}
                   </div>
                 ))}
              </div>
          </div>
        </div>

        {/* ── Sticky Action Bar ── */}
        <div className="sticky bottom-8 z-[20] p-6 rounded-[2.5rem] bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between shadow-2xl shadow-blue-500/10 gap-4 border border-white/5">
           <div>
              <p className="font-black text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-400" /> Ready to Update?
              </p>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Changes propagate across the system instantly</p>
           </div>
           <button
             type="submit"
             disabled={saving}
             className="w-full sm:w-auto px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 group"
           >
             {saving ? (
               <>
                 <Loader2 className="w-5 h-5 animate-spin" />
                 Processing...
               </>
             ) : (
               <>
                 <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                 Confirm Changes
               </>
             )}
           </button>
        </div>
      </form>
    </div>
  );
}
