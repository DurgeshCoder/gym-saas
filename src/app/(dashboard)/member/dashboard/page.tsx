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
    <div className="space-y-8 max-w-[1400px] mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back, {session.user.name?.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground">Here is your quick overview and real-time status.</p>
        </div>
      </div>

      <div className="flex md:grid overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-4 md:pb-0 gap-4 md:gap-6 md:grid-cols-3 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-none">
        
        {/* Subscription Summary Card */}
        <Card className="min-w-[280px] md:min-w-0 shrink-0 snap-center flex flex-col relative overflow-hidden group hover:shadow-md transition-all duration-200 border-border/60 hover:border-border bg-card">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500/80 via-blue-500/30 to-transparent" />
          <div className="absolute -top-6 -right-6 p-4 opacity-[0.03] pointer-events-none transition-transform duration-500 group-hover:scale-125">
            <CreditCard className="w-32 h-32" />
          </div>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[15px] font-semibold flex items-center gap-2.5 text-foreground">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                </div>
                Subscription
              </CardTitle>
              {sub && (
                <div className={`px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ring-1 ring-inset ${sub.active ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20' : 'bg-slate-50 text-slate-600 ring-slate-500/20 dark:bg-slate-500/10 dark:text-slate-400 dark:ring-slate-500/20'}`}>
                  {sub.active ? "ACTIVE" : "INACTIVE"}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 relative z-10 pt-0">
            {sub ? (
              <div className="space-y-2.5">
                <div>
                  <p className="font-extrabold text-xl text-foreground tracking-tight leading-tight">
                    {sub.plan.name}
                  </p>
                  <p className="text-[13px] text-muted-foreground mt-0.5 font-medium">Expires on {new Date(sub.endDate).toLocaleDateString()}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5 flex flex-col justify-center h-full">
                <p className="text-[13px] text-muted-foreground font-medium">No active subscription.</p>
                <p className="text-[12px] text-muted-foreground/70">Please renew at the front desk.</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-3 border-t border-border/40 relative z-10 bg-muted/20">
            <Link href="/member/subscription" className="w-full flex items-center justify-between text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors py-1.5 px-1 group/link">
              <span>View Details</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
            </Link>
          </CardFooter>
        </Card>

        {/* Workout Plan Summary Card */}
        <Card className="min-w-[280px] md:min-w-0 shrink-0 snap-center flex flex-col relative overflow-hidden group hover:shadow-md transition-all duration-200 border-border/60 hover:border-border bg-card">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/80 via-emerald-500/30 to-transparent" />
          <div className="absolute -top-6 -right-6 p-4 opacity-[0.03] pointer-events-none transition-transform duration-500 group-hover:scale-125">
            <Dumbbell className="w-32 h-32" />
          </div>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[15px] font-semibold flex items-center gap-2.5 text-foreground">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Dumbbell className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                Workout Plan
              </CardTitle>
              {workout && (
                <div className="px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-primary/10 text-primary ring-1 ring-inset ring-primary/20 uppercase">
                  {workout.status}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 relative z-10 pt-0">
            {workout ? (
              <div className="space-y-3">
                <div>
                  <p className="font-extrabold text-xl text-foreground tracking-tight leading-tight">
                    {workout.workoutPlan.name}
                  </p>
                  <p className="text-[13px] text-muted-foreground mt-0.5 capitalize font-medium">
                    {workout.workoutPlan.difficulty.charAt(0) + workout.workoutPlan.difficulty.slice(1).toLowerCase()}
                    {workout.workoutPlan.goal && (
                      <> &middot; {workout.workoutPlan.goal.replace(/_/g, " ").toLowerCase()}</>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-semibold bg-secondary ring-1 ring-inset ring-border rounded-md px-2 py-0.5 text-secondary-foreground/70">
                    {workout.workoutPlan.duration} DAYS
                  </span>
                  <span className="text-[11px] font-semibold bg-secondary ring-1 ring-inset ring-border rounded-md px-2 py-0.5 text-secondary-foreground/70">
                    {workout.workoutPlan.days?.length ?? 0} SESSIONS
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5 flex flex-col justify-center h-full">
                <p className="text-[13px] text-muted-foreground font-medium">No workout plan assigned.</p>
                <p className="text-[12px] text-muted-foreground/70">Speak to your trainer to get started.</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-3 border-t border-border/40 relative z-10 bg-muted/20">
            <Link href="/member/workout-plan" className="w-full flex items-center justify-between text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors py-1.5 px-1 group/link">
              <span>{workout ? "View Full Plan" : "Learn More"}</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
            </Link>
          </CardFooter>
        </Card>

        {/* Diet Plan Summary Card */}
        <Card className="min-w-[280px] md:min-w-0 shrink-0 snap-center flex flex-col relative overflow-hidden group hover:shadow-md transition-all duration-200 border-border/60 hover:border-border bg-card">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500/80 via-orange-500/30 to-transparent" />
          <div className="absolute -top-6 -right-6 p-4 opacity-[0.03] pointer-events-none transition-transform duration-500 group-hover:scale-125">
            <Utensils className="w-32 h-32" />
          </div>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[15px] font-semibold flex items-center gap-2.5 text-foreground">
                <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Utensils className="w-3.5 h-3.5 text-orange-500" />
                </div>
                Diet Plan
              </CardTitle>
              {diet && (
                <div className="px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-primary/10 text-primary ring-1 ring-inset ring-primary/20 uppercase">
                  {diet.status}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 relative z-10 pt-0">
            {diet ? (
              <div className="space-y-2.5">
                <div>
                  <p className="font-extrabold text-xl text-foreground tracking-tight leading-tight">
                    {diet.dietPlan.name}
                  </p>
                  <p className="text-[13px] text-muted-foreground mt-0.5 capitalize font-medium">
                    {diet.dietPlan.totalCalories} kcal &middot; {diet.dietPlan.goal.replace(/_/g, " ").toLowerCase()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5 flex flex-col justify-center h-full">
                <p className="text-[13px] text-muted-foreground font-medium">No diet plan assigned.</p>
                <p className="text-[12px] text-muted-foreground/70">Consult your trainer for a plan.</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-3 border-t border-border/40 relative z-10 bg-muted/20">
            <Link href="/member/diet-plan" className="w-full flex items-center justify-between text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors py-1.5 px-1 group/link">
              <span>View Details</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
