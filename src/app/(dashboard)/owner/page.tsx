import { Users, TrendingUp, AlertCircle, Dumbbell } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { RevenueChart } from "./RevenueChart";

export default async function OwnerDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) return null;

  const gymId = (session.user as any).gymId;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Safely execute all queries concurrently to maximize speed if gymId exists
  const [totalMembers, activeSubscriptions, revenueAgg, expiringSoon, recentMembers, paymentsLast6Months] = gymId ? await Promise.all([
    prisma.user.count({ where: { gymId, role: "MEMBER" } }),
    prisma.subscription.count({ where: { gymId, active: true, endDate: { gte: now } } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { gymId, status: "SUCCESS", createdAt: { gte: startOfMonth } } }),
    prisma.subscription.count({ where: { gymId, active: true, endDate: { gte: now, lte: nextWeek } } }),
    prisma.user.findMany({
      where: { gymId, role: "MEMBER" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        subscriptions: {
          where: { active: true, endDate: { gte: now } },
          include: { plan: true },
          take: 1
        }
      }
    }),
    prisma.payment.findMany({
      where: {
        gymId,
        status: "SUCCESS",
        createdAt: { gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) }
      },
      select: { amount: true, createdAt: true }
    })
  ]) : [0, 0, { _sum: { amount: 0 } }, 0, [], []];

  const monthlyRevenue = revenueAgg._sum.amount || 0;

  // Process chart data for the last 6 months
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyData: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyData[monthNames[d.getMonth()]] = 0;
  }

  paymentsLast6Months.forEach(payment => {
    const month = monthNames[payment.createdAt.getMonth()];
    if (monthlyData[month] !== undefined) {
      monthlyData[month] += payment.amount;
    }
  });

  const chartData = Object.keys(monthlyData).map(month => ({
    name: month,
    revenue: monthlyData[month]
  }));

  const stats = [
    { name: "Total Members", value: totalMembers.toString(), icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { name: "Active Subscriptions", value: activeSubscriptions.toString(), icon: Dumbbell, color: "text-emerald-600", bg: "bg-emerald-100" },
    { name: "Monthly Revenue", value: `₹${monthlyRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-100" },
    { name: "Expiring Soon", value: expiringSoon.toString(), icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-100" },
  ];

  return (
    <div className="space-y-6">
      {!gymId && (
        <Card className="mb-6 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-yellow-900 dark:text-yellow-400">You haven't set up a Gym yet!</h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-500">Please create your gym profile to unlock full features.</p>
            </div>
            <Link href="/owner/settings" className={buttonVariants({ variant: "default" })}>
              Create Gym Now
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-4 rounded-xl ${stat.bg} dark:bg-opacity-20`}>
                <stat.icon className={`w-8 h-8 ${stat.color} dark:brightness-110`} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentMembers.length > 0 ? recentMembers.map((member: any) => {
              const activeSub = member.subscriptions?.[0];
              const daysAgo = Math.floor((now.getTime() - new Date(member.createdAt).getTime()) / (1000 * 3600 * 24));
              
              return (
                <div key={member.id} className="flex items-center gap-4 p-3 hover:bg-muted rounded-lg transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-secondary border-2 border-background shadow-sm flex items-center justify-center font-bold text-muted-foreground uppercase">
                    {member.name.substring(0, 2)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{member.name}</p>
                    <p className="text-xs text-muted-foreground">Joined {daysAgo === 0 ? "today" : `${daysAgo} days ago`}</p>
                  </div>
                  {activeSub ? (
                    <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full text-center">
                      <span className="block text-xs opacity-80 leading-tight">Active</span>
                      {activeSub.plan.name}
                    </div>
                  ) : (
                    <div className="text-[10px] font-bold uppercase text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                      No Plan
                    </div>
                  )}
                </div>
              );
            }) : (
              <div className="text-center py-6 text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No members registered yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="min-h-[300px]">
          <RevenueChart data={chartData} />
        </div>
      </div>
    </div>
  );
}
