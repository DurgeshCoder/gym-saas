import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMemberDashboardData } from "@/lib/queries/member";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Dumbbell, Utensils, CreditCard, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Member Dashboard | Gym SaaS",
};

export default async function MemberDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !(session.user as any).id) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  if (role !== "MEMBER" && role !== "GYM_OWNER" && role !== "SUPER_ADMIN" && role !== "TRAINER") {
    redirect("/login");
  }

  const dashboardData = await getMemberDashboardData((session.user as any).id);

  const sub = dashboardData.subscription;
  const diet = dashboardData.dietPlan;
  const workout = dashboardData.workoutPlan;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
          Welcome back, {session.user.name?.split(" ")[0]}!
        </h1>
        <p className="text-muted-foreground">Here is your quick overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Subscription Summary Card */}
        <Card className="flex flex-col relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-transform group-hover:scale-110">
            <CreditCard className="w-24 h-24" />
          </div>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Subscription
              </CardTitle>
              {sub && <Badge variant={sub.active ? "default" : "secondary"}>{sub.active ? "Active" : "Inactive"}</Badge>}
            </div>
          </CardHeader>
          <CardContent className="flex-1 relative z-10">
            {sub ? (
              <div className="space-y-1">
                <p className="font-semibold text-xl">{sub.plan.name}</p>
                <p className="text-sm text-muted-foreground">Expires on {new Date(sub.endDate).toLocaleDateString()}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No active subscription found.</p>
            )}
          </CardContent>
          <CardFooter className="pt-4 border-t relative z-10 bg-muted/10">
            <Link href="/member/subscription" className="w-full flex items-center justify-between text-sm font-medium hover:text-primary py-2 px-1">
              View Details <ChevronRight className="w-4 h-4" />
            </Link>
          </CardFooter>
        </Card>

        {/* Workout Plan Summary Card */}
        <Card className="flex flex-col relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-transform group-hover:scale-110">
            <Dumbbell className="w-24 h-24" />
          </div>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-primary" />
                Workout Plan
              </CardTitle>
              {workout && <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{workout.status}</Badge>}
            </div>
          </CardHeader>
          <CardContent className="flex-1 relative z-10">
            {workout ? (
              <div className="space-y-1">
                <p className="font-semibold text-xl">{workout.workoutPlan.name}</p>
                <p className="text-sm text-muted-foreground">{workout.workoutPlan.duration} Days &bull; <span className="capitalize">{workout.workoutPlan.difficulty.toLowerCase()}</span></p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No active workout plan assigned.</p>
            )}
          </CardContent>
          <CardFooter className="pt-4 border-t relative z-10 bg-muted/10">
            <Link href="/member/workout-plan" className="w-full flex items-center justify-between text-sm font-medium hover:text-primary py-2 px-1">
              View Details <ChevronRight className="w-4 h-4" />
            </Link>
          </CardFooter>
        </Card>

        {/* Diet Plan Summary Card */}
        <Card className="flex flex-col relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-transform group-hover:scale-110">
            <Utensils className="w-24 h-24" />
          </div>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Utensils className="w-5 h-5 text-primary" />
                Diet Plan
              </CardTitle>
              {diet && <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{diet.status}</Badge>}
            </div>
          </CardHeader>
          <CardContent className="flex-1 relative z-10">
            {diet ? (
              <div className="space-y-1">
                <p className="font-semibold text-xl">{diet.dietPlan.name}</p>
                <p className="text-sm text-muted-foreground capitalize">{diet.dietPlan.totalCalories} kcal &bull; {diet.dietPlan.goal.replace("_", " ").toLowerCase()}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No active diet plan assigned.</p>
            )}
          </CardContent>
          <CardFooter className="pt-4 border-t relative z-10 bg-muted/10">
            <Link href="/member/diet-plan" className="w-full flex items-center justify-between text-sm font-medium hover:text-primary py-2 px-1">
              View Details <ChevronRight className="w-4 h-4" />
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
