import { Building2, Users, Activity } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function SuperAdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return null;

  // Let's actually fetch real minimal stats
  const totalGyms = await prisma.gym.count();
  const totalUsers = await prisma.user.count();

  const stats = [
    { name: "Total Gyms", value: totalGyms.toString(), icon: Building2, color: "text-blue-600", bg: "bg-blue-100" },
    { name: "Global Users", value: totalUsers.toString(), icon: Users, color: "text-emerald-600", bg: "bg-emerald-100" },
    { name: "System Health", value: "99.9%", icon: Activity, color: "text-purple-600", bg: "bg-purple-100" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-6">System Overview</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.name} className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-4 rounded-xl ${stat.bg} dark:bg-opacity-20`}>
              <stat.icon className={`w-8 h-8 ${stat.color} dark:brightness-110`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.name}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
