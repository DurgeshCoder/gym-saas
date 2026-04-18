import { Users, TrendingUp, AlertCircle, Dumbbell } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getFileUrl } from "@/services/upload-service";
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
    { name: "Total Members", value: totalMembers.toString(), icon: Users, color: "text-blue-600", bg: "bg-blue-100", halo: "from-blue-500/20" },
    { name: "Active Subs", value: activeSubscriptions.toString(), icon: Dumbbell, color: "text-emerald-600", bg: "bg-emerald-100", halo: "from-emerald-500/20" },
    { name: "Monthly Rev", value: `₹${monthlyRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-100", halo: "from-purple-500/20" },
    { name: "Expiring Soon", value: expiringSoon.toString(), icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-100", halo: "from-rose-500/20" },
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group bg-card">
            <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${stat.halo} to-transparent blur-2xl rounded-full transition-transform group-hover:scale-150 duration-500`} />
            <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 relative z-10">
              <div className={`p-2.5 sm:p-3.5 rounded-xl ${stat.bg} dark:bg-opacity-20 flex-shrink-0`}>
                <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color} dark:brightness-110`} />
              </div>
              <div className="w-full">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{stat.name}</p>
                <p className="text-lg sm:text-2xl font-bold text-foreground mt-0.5 sm:mt-1 tracking-tight truncate">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="border-border/50 shadow-sm flex flex-col">
          <CardHeader className="pb-4 sm:pb-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Members</CardTitle>
              <Link href="/owner/users" className="text-xs sm:text-sm text-primary font-medium hover:underline">View All</Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentMembers.length > 0 ? recentMembers.map((member: any) => {
              const activeSub = member.subscriptions?.[0];
              const daysAgo = Math.floor((now.getTime() - new Date(member.createdAt).getTime()) / (1000 * 3600 * 24));
              
              return (
                <div key={member.id} className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-start gap-3 p-3 hover:bg-muted/50 rounded-xl transition-colors border border-transparent hover:border-border/50">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-secondary border border-border shadow-sm overflow-hidden flex items-center justify-center font-bold text-muted-foreground uppercase flex-shrink-0">
                      {member.profilePhoto ? (
                        <img src={getFileUrl(member.profilePhoto)} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        member.name.substring(0, 2)
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground truncate">Joined {daysAgo === 0 ? "today" : `${daysAgo} days ago`}</p>
                    </div>
                  </div>
                  {activeSub ? (
                    <div className="text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md text-right sm:text-center flex-shrink-0 max-w-[120px] truncate border border-emerald-500/20">
                      {activeSub.plan.name}
                    </div>
                  ) : (
                    <div className="text-[10px] font-bold uppercase text-slate-500 bg-slate-500/10 px-2.5 py-1 rounded-md border border-slate-500/20 flex-shrink-0">
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
