import { Dumbbell, CalendarDays, Activity } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function MemberDashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-xl bg-blue-100 dark:bg-opacity-20`}>
              <Dumbbell className={`w-8 h-8 text-blue-600 dark:brightness-110`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Current Plan</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">Free Trial</p>
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            <button className="flex-1 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 font-semibold rounded-lg text-sm transition">Upgrade Plan</button>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-xl bg-emerald-100 dark:bg-opacity-20`}>
              <Activity className={`w-8 h-8 text-emerald-600 dark:brightness-110`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">My Trainer</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">Not Assigned</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-xl bg-purple-100 dark:bg-opacity-20`}>
              <CalendarDays className={`w-8 h-8 text-purple-600 dark:brightness-110`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Next Booking</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">None</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mt-8">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">My Workout Plan</h3>
        <div className="text-center p-8 text-slate-500">
          <Activity className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p>You don't have an active workout plan. Once a trainer assigns one, it will appear here.</p>
        </div>
      </div>
    </div>
  );
}
