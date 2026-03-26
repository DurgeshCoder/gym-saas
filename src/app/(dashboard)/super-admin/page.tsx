import { Building2, Users, Activity } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SuperAdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return null;

  const totalGyms = await prisma.gym.count();
  const totalUsers = await prisma.user.count();

  const stats = [
    { name: "Total Gyms", value: totalGyms.toString(), icon: Building2, color: "text-blue-600", bg: "bg-blue-500/10" },
    { name: "Global Users", value: totalUsers.toString(), icon: Users, color: "text-emerald-600", bg: "bg-emerald-500/10" },
    { name: "System Health", value: "99.9%", icon: Activity, color: "text-purple-600", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">System Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform-wide analytics and health monitoring.</p>
      </div>

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
    </div>
  );
}
