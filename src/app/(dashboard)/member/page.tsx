import { Dumbbell, CalendarDays, Activity } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function MemberDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-blue-500/10">
                <Dumbbell className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
                <p className="text-xl font-bold text-foreground mt-1">Free Trial</p>
              </div>
            </div>
            <div className="mt-6">
              <Button variant="secondary" className="w-full">Upgrade Plan</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-emerald-500/10">
                <Activity className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">My Trainer</p>
                <p className="text-xl font-bold text-foreground mt-1">Not Assigned</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-purple-500/10">
                <CalendarDays className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Next Booking</p>
                <p className="text-xl font-bold text-foreground mt-1">None</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Workout Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">You don't have an active workout plan. Once a trainer assigns one, it will appear here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
