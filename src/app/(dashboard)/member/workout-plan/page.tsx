import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMemberDashboardData } from "@/lib/queries/member";
import { WorkoutPlanCard } from "../dashboard/components/WorkoutPlanCard";

export const metadata = {
  title: "My Workout Plan | Gym SaaS",
};

export default async function WorkoutPlanPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !(session.user as any).id) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  if (role !== "MEMBER" && role !== "GYM_OWNER" && role !== "SUPER_ADMIN" && role !== "TRAINER") {
    redirect("/login");
  }

  const dashboardData = await getMemberDashboardData((session.user as any).id);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Workout Plan details</h1>
        <p className="text-muted-foreground">Follow your personalized workout routines step by step.</p>
      </div>

      <div className="h-full">
        <WorkoutPlanCard memberWorkoutPlan={dashboardData.workoutPlan} />
      </div>
    </div>
  );
}
