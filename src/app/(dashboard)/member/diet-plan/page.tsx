import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMemberDashboardData } from "@/lib/queries/member";
import { DietPlanCard } from "../dashboard/components/DietPlanCard";

export const metadata = {
  title: "My Diet Plan | Gym SaaS",
};

export default async function DietPlanPage() {
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
        <h1 className="text-3xl font-bold tracking-tight">Diet Plan details</h1>
        <p className="text-muted-foreground">Keep track of your meals and macros dynamically.</p>
      </div>

      <div className="h-full">
        <DietPlanCard memberDietPlan={dashboardData.dietPlan} />
      </div>
    </div>
  );
}
