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
  Utensils,
  Receipt,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [gymName, setGymName] = useState<string | null>(null);
  const [gymLogo, setGymLogo] = useState<string | null>(null);

  const role: string = (session?.user as any)?.role || "MEMBER";
  const gymId: string | null = (session?.user as any)?.gymId || null;

  // Fetch gym name for GYM_OWNER / TRAINER / MEMBER
  useEffect(() => {
    if (gymId && role !== "SUPER_ADMIN") {
      fetch(`/api/gyms/${gymId}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.name) setGymName(data.name);
          if (data?.logo) setGymLogo(data.logo);
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
    { name: "Diet Plans", href: "/owner/diets", icon: Utensils },
    { name: "Subscriptions", href: "/owner/subscriptions", icon: CalendarDays },
    { name: "Reminders", href: "/owner/subscriptions/reminders", icon: Bell },
    { name: "Payments", href: "/owner/payments", icon: CreditCard },
    { name: "Gym Settings", href: "/owner/settings", icon: Settings },
  ];

  const trainerLinks = [
    { name: "My Dashboard", href: "/trainer", icon: LayoutDashboard },
    { name: "My Members", href: "/trainer/members", icon: Users },
    { name: "Bookings", href: "/trainer/bookings", icon: CalendarDays },
  ];

  const memberLinks = [
    { name: "Dashboard", href: "/member/dashboard", icon: LayoutDashboard },
    { name: "My Subscription", href: "/member/subscription", icon: CreditCard },
    { name: "My Workout Plan", href: "/member/workout-plan", icon: Dumbbell },
    { name: "My Diet Plan", href: "/member/diet-plan", icon: Utensils },
    { name: "Payments", href: "/member/payments", icon: Receipt },
    { name: "My Profile", href: "/member/profile", icon: Users },
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
  let brandName = "FixHubX";
  let brandIcon = <Dumbbell className="w-7 h-7" />;
  let brandSub = role.replace("_", " ");

  if (role === "SUPER_ADMIN") {
    brandName = "FixHubX";
    brandIcon = <ShieldCheck className="w-7 h-7" />;
    brandSub = "SUPER ADMIN";
  } else if (gymName) {
    brandName = gymName;
    brandSub = role.replace("_", " ");
    if (gymLogo) {
      brandIcon = <img src={gymLogo} alt={gymName} className="w-7 h-7 rounded-sm object-cover" />;
    }
  }

  return (
    <SidebarProvider>
      <div className="flex w-full h-screen bg-background text-foreground overflow-hidden">
        {/* Sidebar */}
        <Sidebar className="border-r border-border">
          <SidebarHeader className="p-6 border-b border-border">
            <h1 className="text-xl font-bold flex items-center gap-2 text-primary truncate">
              {brandIcon}
              <span className="truncate">{brandName}</span>
            </h1>
            <span className="text-[10px] text-muted-foreground mt-1 block uppercase font-bold tracking-widest">
              {brandSub}
            </span>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;

                    return (
                      <SidebarMenuItem key={link.href}>
                        <SidebarMenuButton
                          isActive={isActive}
                          tooltip={link.name}
                          className="font-medium h-12"
                          render={
                            <Link href={link.href} className="flex items-center gap-3">
                              <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
                              <span>{link.name}</span>
                            </Link>
                          }
                        />
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-border">
            <div className="flex items-center gap-3 px-2 py-2 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden shrink-0">
                {session?.user?.image ? (
                  <img src={session.user.image} alt={session.user.name || "User"} className="w-full h-full object-cover" />
                ) : (
                  session?.user?.name?.charAt(0) || "U"
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-foreground truncate">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center gap-3 px-4 py-3 text-destructive hover:bg-destructive/10 rounded-xl transition-all font-medium"
            >
              <LogOut className="w-5 h-5 text-destructive" />
              Sign Out
            </button>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content Area */}
        <main className="flex-1 w-full overflow-y-auto min-w-0 bg-background">
          <header className="h-16 bg-background border-b flex items-center justify-between px-4 sm:px-8 shadow-sm">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <h2 className="text-lg font-semibold hidden sm:flex">
                {links.find((l) => l.href === pathname)?.name || "Dashboard Overview"}
              </h2>
            </div>
            <ThemeToggle />
          </header>
          <div className="p-4 sm:p-8">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
