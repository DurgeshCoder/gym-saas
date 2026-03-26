import { Users, TrendingUp, AlertCircle, Dumbbell } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function OwnerDashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) return null;

  const gymId = (session.user as any).gymId;

  // Placeholder query values for now. 
  // Normally you'd aggregate: e.g. await prisma.user.count({ where: { gymId, role: "MEMBER" } })

  const stats = [
    { name: "Total Members", value: "24", icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { name: "Active Subscriptions", value: "18", icon: Dumbbell, color: "text-emerald-600", bg: "bg-emerald-100" },
    { name: "Monthly Revenue", value: "$4,290", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-100" },
    { name: "Expiring Soon", value: "3", icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-100" },
  ];

  return (
    <div className="space-y-6">
      {!gymId && (
        <div className="p-4 mb-6 text-yellow-800 bg-yellow-50 rounded-xl border border-yellow-200 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="font-bold text-yellow-900">You haven't set up a Gym yet!</h3>
            <p className="text-sm">Please create your gym profile to unlock full features.</p>
          </div>
          <button className="px-4 py-2 bg-yellow-600 text-white text-sm font-semibold rounded-lg hover:bg-yellow-700 transition">
            Create Gym Now
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Recent Activity / Chart Placeholder */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Members</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white shadow-sm" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Member Name {i}</p>
                  <p className="text-xs text-slate-500">Joined 2 days ago</p>
                </div>
                <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full">
                  Active Pro
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center min-h-[300px]">
          <Dumbbell className="w-16 h-16 text-slate-200 dark:text-slate-700 mb-4" />
          <p className="text-slate-500 font-medium">Revenue Chart (Coming Soon)</p>
        </div>
      </div>
    </div>
  );
}
