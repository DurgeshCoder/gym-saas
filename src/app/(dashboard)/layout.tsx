"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Dumbbell,
  CalendarDays,
  CreditCard,
  Building2,
  ShieldCheck,
  Activity,
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [gymName, setGymName] = useState<string | null>(null);

  const role: string = (session?.user as any)?.role || "MEMBER";
  const gymId: string | null = (session?.user as any)?.gymId || null;

  // Fetch gym name for GYM_OWNER / TRAINER / MEMBER
  useEffect(() => {
    if (gymId && role !== "SUPER_ADMIN") {
      fetch(`/api/gyms/${gymId}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.name) setGymName(data.name);
        })
        .catch(() => { });
    }
  }, [gymId, role]);

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center text-slate-500">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
          Loading your workspace...
        </div>
      </div>
    );
  }

  // Navigation links per role
  const ownerLinks = [
    { name: "Dashboard", href: "/owner", icon: LayoutDashboard },
    { name: "Users & Staff", href: "/owner/users", icon: Users },
    { name: "Membership Plans", href: "/owner/plans", icon: Dumbbell },
    { name: "Workout Plans", href: "/owner/workouts", icon: Activity },
    { name: "Subscriptions", href: "/owner/subscriptions", icon: CalendarDays },
    { name: "Payments", href: "/owner/payments", icon: CreditCard },
    { name: "Gym Settings", href: "/owner/settings", icon: Settings },
  ];

  const trainerLinks = [
    { name: "My Dashboard", href: "/trainer", icon: LayoutDashboard },
    { name: "My Members", href: "/trainer/members", icon: Users },
    { name: "Bookings", href: "/trainer/bookings", icon: CalendarDays },
  ];

  const memberLinks = [
    { name: "My Dashboard", href: "/member", icon: LayoutDashboard },
    { name: "My Plan", href: "/member/plan", icon: Dumbbell },
    { name: "Bookings", href: "/member/bookings", icon: CalendarDays },
  ];

  const superAdminLinks = [
    { name: "Super Admin", href: "/super-admin", icon: LayoutDashboard },
    { name: "All Gyms", href: "/super-admin/gyms", icon: Building2 },
    { name: "Global Users", href: "/super-admin/users", icon: Users },
  ];

  let links = memberLinks;
  if (role === "GYM_OWNER") links = ownerLinks;
  if (role === "SUPER_ADMIN") links = superAdminLinks;
  if (role === "TRAINER") links = trainerLinks;

  // Brand display logic
  let brandName = "GymFlow";
  let brandIcon = <Dumbbell className="w-7 h-7" />;
  let brandSub = role.replace("_", " ");

  if (role === "SUPER_ADMIN") {
    brandName = "GymFlow";
    brandIcon = <ShieldCheck className="w-7 h-7" />;
    brandSub = "SUPER ADMIN";
  } else if (gymName) {
    brandName = gymName;
    brandSub = role.replace("_", " ");
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h1 className="text-xl font-bold flex items-center gap-2 text-blue-600 dark:text-blue-400 truncate">
            {brandIcon}
            <span className="truncate">{brandName}</span>
          </h1>
          <span className="text-[10px] text-slate-500 mt-1 block uppercase font-bold tracking-widest">
            {brandSub}
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                  }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 px-4 py-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold">
              {session?.user?.name?.charAt(0) || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {session?.user?.name}
              </p>
              <p className="text-xs text-slate-500 truncate">{session?.user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all font-medium"
          >
            <LogOut className="w-5 h-5 text-red-500" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
            {links.find((l) => l.href === pathname)?.name || "Dashboard Overview"}
          </h2>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
