import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMemberWorkoutPlans } from "@/lib/queries/member";
import { WorkoutPlanView } from "../dashboard/components/WorkoutPlanCard";
import { Dumbbell } from "lucide-react";

export const metadata = {
  title: "My Workout Plan | Gym SaaS",
};

export default async function WorkoutPlanPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !(session.user as any).id) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  if (
    role !== "MEMBER" &&
    role !== "GYM_OWNER" &&
    role !== "SUPER_ADMIN" &&
    role !== "TRAINER"
  ) {
    redirect("/login");
  }

  const allPlans = await getMemberWorkoutPlans((session.user as any).id);

  // Separate active vs historical
  const activePlan = allPlans.find((p) => p.status === "ACTIVE") ?? null;
  const historyPlans = allPlans.filter((p) => p.status !== "ACTIVE");

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pb-16">
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Dumbbell className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground leading-tight">
            My Workout Plan
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Follow your personalized training routine step by step.
          </p>
        </div>
      </div>

      {/* ── Plan Card ─────────────────────────────────────────────────── */}
      <WorkoutPlanView activePlan={activePlan} historyPlans={historyPlans} />
    </div>
  );
}
