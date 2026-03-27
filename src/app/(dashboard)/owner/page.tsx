import { Users, TrendingUp, AlertCircle, Dumbbell } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function OwnerDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) return null;

  const gymId = (session.user as any).gymId;

  // Placeholder query values for now. 
  // Normally you'd aggregate: e.g. await prisma.user.count({ where: { gymId, role: "MEMBER" } })

  const stats = [
    { name: "Total Members", value: "24", icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { name: "Active Subscriptions", value: "18", icon: Dumbbell, color: "text-emerald-600", bg: "bg-emerald-100" },
    { name: "Monthly Revenue", value: "₹4,290", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-100" },
    { name: "Expiring Soon", value: "3", icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-100" },
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
            <Button>
              Create Gym Now
            </Button>
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
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 hover:bg-muted rounded-lg transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-secondary border-2 border-background shadow-sm" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Member Name {i}</p>
                  <p className="text-xs text-muted-foreground">Joined 2 days ago</p>
                </div>
                <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full">
                  Active Pro
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center justify-center min-h-[300px]">
          <CardContent className="flex flex-col items-center justify-center pt-6">
            <Dumbbell className="w-16 h-16 text-muted mb-4" />
            <p className="text-muted-foreground font-medium">Revenue Chart (Coming Soon)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
