import {
  Users,
  TrendingUp,
  AlertCircle,
  Dumbbell,
  Banknote,
} from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getFileUrl } from "@/services/upload-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { RevenueChart } from "./RevenueChart";
import { ActiveMembersPieChart } from "./ActiveMembersPieChart";

export default async function OwnerDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) return null;

  const gymId = (session.user as any).gymId;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Safely execute all queries concurrently to maximize speed if gymId exists
  const [
    totalMembers,
    activeSubscriptionsData,
    revenueAgg,
    expiringSoon,
    recentMembers,
    paymentsLast6Months,
  ] = gymId
    ? await Promise.all([
        prisma.user.count({ where: { gymId, role: "MEMBER" } }),
        prisma.subscription.findMany({
          where: { gymId, active: true, endDate: { gte: now } },
          include: { plan: true },
        }),
        prisma.payment.aggregate({
          _sum: { amount: true },
          where: { gymId, status: "SUCCESS", createdAt: { gte: startOfMonth } },
        }),
        prisma.subscription.count({
          where: { gymId, active: true, endDate: { gte: now, lte: nextWeek } },
        }),
        prisma.user.findMany({
          where: { gymId, role: "MEMBER" },
          orderBy: { createdAt: "desc" },
          take: 5,
          include: {
            subscriptions: {
              where: { active: true, endDate: { gte: now } },
              include: { plan: true },
              take: 1,
            },
          },
        }),
        prisma.payment.findMany({
          where: {
            gymId,
            status: "SUCCESS",
            createdAt: {
              gte: new Date(now.getFullYear(), now.getMonth() - 5, 1),
            },
          },
          select: { amount: true, createdAt: true },
        }),
      ])
    : [0, [], { _sum: { amount: 0 } }, 0, [], []];

  const monthlyRevenue = revenueAgg._sum.amount || 0;

  const activeSubscriptions = activeSubscriptionsData.length;
  // Unique users with active subscriptions
  const activeMembersCount = new Set(
    activeSubscriptionsData.map((s) => s.userId),
  ).size;
  const inactiveMembersCount = Math.max(0, totalMembers - activeMembersCount);

  // MRR Calculation based on actual Plan price spread over 30 days
  const mrr = activeSubscriptionsData.reduce((acc, sub) => {
    // If a plan has 0 price or no duration, handle it safely
    if (!sub.plan || !sub.plan.price || !sub.plan.duration) return acc;
    // Calculate Monthly Recurring Revenue for this plan
    const monthlyPrice = (sub.plan.price / sub.plan.duration) * 30;
    return acc + monthlyPrice;
  }, 0);

  // Process chart data for the last 6 months
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthlyData: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyData[monthNames[d.getMonth()]] = 0;
  }

  paymentsLast6Months.forEach((payment) => {
    const month = monthNames[payment.createdAt.getMonth()];
    if (monthlyData[month] !== undefined) {
      monthlyData[month] += payment.amount;
    }
  });

  const chartData = Object.keys(monthlyData).map((month) => ({
    name: month,
    revenue: monthlyData[month],
  }));

  const stats = [
    {
      name: "Total Members",
      value: totalMembers.toString(),
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-500/10",
      border: "from-blue-500/50",
    },
    {
      name: "Active Subs",
      value: activeSubscriptions.toString(),
      icon: Dumbbell,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-500/10",
      border: "from-emerald-500/50",
    },
    {
      name: "MRR",
      value: `₹${Math.round(mrr).toLocaleString()}`,
      icon: TrendingUp,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-500/10",
      border: "from-purple-500/50",
    },
    {
      name: "Collected (MTD)",
      value: `₹${monthlyRevenue.toLocaleString()}`,
      icon: Banknote,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-100 dark:bg-indigo-500/10",
      border: "from-indigo-500/50",
    },
    {
      name: "Expiring Soon",
      value: expiringSoon.toString(),
      icon: AlertCircle,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-100 dark:bg-rose-500/10",
      border: "from-rose-500/50",
    },
  ];

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Overview
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor your gym's core metrics, revenue growth, and live member
            activity.
          </p>
        </div>
      </div>

      {!gymId && (
        <Card className="bg-yellow-50/50 border-yellow-200/50 dark:bg-yellow-900/10 dark:border-yellow-700/30 shadow-none">
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg shrink-0 h-min">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-400">
                  Gym Profile Missing
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-500 mt-0.5">
                  You must create your gym profile before you can access all
                  features.
                </p>
              </div>
            </div>
            <Link
              href="/owner/settings"
              className={buttonVariants({ variant: "default", size: "sm" })}
            >
              Set Up Gym
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid - Premium SaaS Style */}
      <div className="flex   overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-4 scrollbar-none">
        {stats.map((stat) => (
          <Card
            key={stat.name}
            className="min-w-[200px]  border-1 sm:min-w-0 shrink-0 snap-center  shadow-sm hover:shadow-md hover:border-foreground/20 transition-all duration-300 bg-card overflow-hidden group"
          >
            <div
              className={`absolute top-0  left-0 right-0 h-[3px] bg-gradient-to-r ${stat.border} via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300`}
            />
            <CardContent className="p-5  flex flex-col justify-between h-full relative">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide">
                  {stat.name}
                </p>
                <div
                  className={`p-2 rounded-lg transition-colors ${stat.bg} ${stat.color} shadow-sm ring-1 ring-inset ring-black/5 dark:ring-white/10`}
                >
                  <stat.icon className="w-4 h-4" strokeWidth={2.5} />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mt-1 mt-auto">
                <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 min-h-[300px] min-w-0">
          <RevenueChart data={chartData} />
        </div>
        <div className="lg:col-span-1 min-h-[300px] min-w-0">
          <ActiveMembersPieChart
            activeCount={activeMembersCount}
            inactiveCount={inactiveMembersCount}
          />
        </div>
      </div>

      {/* Recent Members Detailed List */}
      <div>
        <Card className="border-border/60 shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="p-5 border-b border-border/40 bg-muted/20">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[15px] font-semibold text-foreground">
                Recent Members
              </CardTitle>
              <Link
                href="/owner/users"
                className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                View All Directory &rarr;
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentMembers.length > 0 ? (
              <div className="divide-y divide-border/40">
                {recentMembers.map((member: any) => {
                  const activeSub = member.subscriptions?.[0];
                  const daysAgo = Math.floor(
                    (now.getTime() - new Date(member.createdAt).getTime()) /
                      (1000 * 3600 * 24),
                  );

                  return (
                    <div
                      key={member.id}
                      className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 p-4 hover:bg-muted/40 transition-colors group"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-full bg-secondary border border-border/50 shadow-sm overflow-hidden flex items-center justify-center font-bold text-muted-foreground uppercase shrink-0 relative">
                          {member.profilePhoto ? (
                            <img
                              src={getFileUrl(member.profilePhoto)}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            member.name.substring(0, 2)
                          )}
                          <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/10 dark:ring-white/10 pointer-events-none" />
                        </div>
                        <div className="min-w-0 flex flex-col">
                          <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {member.name}
                          </p>
                          <p className="text-[13px] text-muted-foreground truncate">
                            Joined{" "}
                            {daysAgo === 0 ? "today" : `${daysAgo} days ago`}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-3">
                        {activeSub ? (
                          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20 truncate max-w-[140px]">
                            {activeSub.plan.name}
                          </div>
                        ) : (
                          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-500/20 dark:bg-slate-500/10 dark:text-slate-400 dark:ring-slate-500/20">
                            Inactive
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 px-4 flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Users className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  No members found
                </h3>
                <p className="text-[13px] text-muted-foreground mt-1 max-w-sm mx-auto">
                  You have not registered any gym members yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
