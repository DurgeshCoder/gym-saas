import { Users, CalendarDays, Activity } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function TrainerDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) return null;

  const stats = [
    { name: "My Assigned Members", value: "12", icon: Users, color: "text-blue-600", bg: "bg-blue-500/10" },
    { name: "Today's Bookings", value: "4", icon: CalendarDays, color: "text-emerald-600", bg: "bg-emerald-500/10" },
    { name: "Active Workout Plans", value: "8", icon: Activity, color: "text-purple-600", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.name} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-4 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No bookings scheduled for today.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
