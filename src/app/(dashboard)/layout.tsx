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
  MessageSquare,
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
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const role: string = (session?.user as any)?.role || "MEMBER";
  const gymId: string | null = (session?.user as any)?.gymId || null;

  // Fetch gym name & unread notifications
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

    if (role === "MEMBER") {
      fetch(`/api/member/notifications`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.unreadCount !== undefined) {
             setUnreadCount(data.unreadCount);
          }
        })
        .catch(() => { });
    }
  }, [gymId, role]);

  // Navigation links per role
  const ownerLinks = [
    { name: "Dashboard", href: "/owner", icon: LayoutDashboard },
    { name: "Users & Staff", href: "/owner/users", icon: Users },
    { name: "Membership Plans", href: "/owner/plans", icon: Dumbbell },
    { name: "Workout Plans", href: "/owner/workouts", icon: Activity },
    { name: "Diet Plans", href: "/owner/diets", icon: Utensils },
    { name: "Subscriptions", href: "/owner/subscriptions", icon: CalendarDays },
    { name: "Reminders", href: "/owner/subscriptions/reminders", icon: Bell },
    { name: "Broadcast", href: "/owner/notifications", icon: MessageSquare },
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
    { name: "Notifications", href: "/member/notifications", icon: Bell },
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
  let brandName = "FitHubX";
  let brandIcon = <Dumbbell className="w-7 h-7" />;
  let brandSub = role.replace("_", " ");

  if (role === "SUPER_ADMIN") {
    brandName = "FitHubX";
    brandIcon = <ShieldCheck className="w-7 h-7" />;
    brandSub = "SUPER ADMIN";
  } else if (gymName) {
    brandName = gymName;
    brandSub = role.replace("_", " ");
    if (gymLogo) {
      brandIcon = <img src={gymLogo} alt={gymName} className="w-7 h-7 rounded-sm object-cover" />;
    }
  }

  // Determine current page title
  const activeLink = [...links].sort((a, b) => b.href.length - a.href.length).find(l => pathname === l.href || pathname.startsWith(l.href + '/'));
  let pageTitle = activeLink ? activeLink.name : "Dashboard";
  
  // Custom titles for deep nested routes
  if (pathname.includes("/workouts/create")) pageTitle = "Create Workout Plan";
  if (pathname.includes("/diets/create")) pageTitle = "Create Diet Plan";

  // Update document title dynamically
  useEffect(() => {
    document.title = `${pageTitle} | ${brandName}`;
  }, [pageTitle, brandName]);

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

  return (
    <SidebarProvider>
      <div className="flex w-full h-screen bg-background text-foreground overflow-hidden">
        {/* Sidebar (Tablet/Desktop & Mobile Sheet) */}
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
                    const isRoot = link.href === "/owner" || link.href === "/trainer" || link.href === "/super-admin" || link.href === "/member/dashboard";
                    const isActive = pathname === link.href || (!isRoot && pathname.startsWith(link.href + '/'));

                    return (
                      <SidebarMenuItem key={link.href}>
                        <SidebarMenuButton
                          isActive={isActive}
                          tooltip={link.name}
                          className={`font-medium h-12 ${isActive ? "bg-primary/10 text-primary" : ""}`}
                          render={
                            <Link href={link.href} className="flex items-center justify-between w-full h-full group">
                              <div className="flex items-center gap-3">
                                <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                                <span>{link.name}</span>
                              </div>
                              {link.name === "Notifications" && unreadCount > 0 && (
                                <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex shrink-0 shadow-sm animate-pulse">
                                  {unreadCount > 99 ? "99+" : unreadCount}
                                </span>
                              )}
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
        <main className="flex-1 w-full h-full overflow-y-auto min-w-0 bg-background pb-20 md:pb-0 relative">
          <header className="sticky top-0 z-40 h-16 bg-background/80 backdrop-blur-md border-b flex items-center justify-between px-4 sm:px-8 shadow-sm">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="md:hidden flex items-center gap-2 text-primary font-bold">
                {brandIcon}
              </div>
              <h2 className="text-lg font-semibold flex">
                {pageTitle}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
            </div>
          </header>
          
          <div className="p-4 sm:p-8 md:max-w-7xl md:mx-auto space-y-6">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border z-50 px-2 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div className="flex justify-around items-center h-16">
            {/* Show top 4-5 priority links for mobile based on role to prevent overcrowding */}
            {links.filter(link => {
              // Prioritize key tabs for bottom nav as requested
              const priorityNames = ['Dashboard', 'Notifications', 'Members', 'My Members', 'Users & Staff', 'Payments', 'My Profile', 'Gym Settings', 'All Gyms'];
              return priorityNames.includes(link.name) || link.name.includes("Dashboard");
            }).slice(0, 5).map((link) => {
              const Icon = link.icon;
              const isRoot = link.href === "/owner" || link.href === "/trainer" || link.href === "/super-admin" || link.href === "/member/dashboard";
              const isActive = pathname === link.href || (!isRoot && pathname.startsWith(link.href + '/'));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-xl"
                  )}
                >
                  <div className="relative">
                    <Icon className={cn("w-5 h-5", isActive ? "scale-110" : "scale-100")} />
                    {link.name === "Notifications" && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-2 w-3 h-3 bg-rose-500 rounded-full border-2 border-background animate-pulse" />
                    )}
                  </div>
                  <span className="text-[10px] font-medium truncate max-w-[64px]">
                    {link.name.replace("My ", "").replace("Gym ", "").replace(" & Staff", "")}
                  </span>
                  {isActive && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
