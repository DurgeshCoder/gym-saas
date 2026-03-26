import { Users, CalendarDays, Activity } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function TrainerDashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) return null;

  const stats = [
    { name: "My Assigned Members", value: "12", icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { name: "Today's Bookings", value: "4", icon: CalendarDays, color: "text-emerald-600", bg: "bg-emerald-100" },
    { name: "Active Workout Plans", value: "8", icon: Activity, color: "text-purple-600", bg: "bg-purple-100" },
  ];

  return (
    <div className="space-y-6">
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

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mt-8">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Today's Schedule</h3>
        <div className="text-center p-8 text-slate-500">
          <CalendarDays className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p>No bookings scheduled for today.</p>
        </div>
      </div>
    </div>
  );
}
