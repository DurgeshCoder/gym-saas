import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllMemberSubscriptions } from "@/lib/queries/member";
import { SubscriptionCard } from "../dashboard/components/SubscriptionCard";

export const metadata = {
  title: "My Subscription | Gym SaaS",
};

export default async function SubscriptionPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !(session.user as any).id) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  if (role !== "MEMBER" && role !== "GYM_OWNER" && role !== "SUPER_ADMIN" && role !== "TRAINER") {
    redirect("/login");
  }

  const subscriptions = await getAllMemberSubscriptions((session.user as any).id);

  return (
    <div className="max-w-5xl  mx-auto space-y-6 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Subscription Details </h1>
        <p className="text-muted-foreground">Manage and view your current and past membership plans.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1  gap-6">
        {subscriptions.filter((sub: any) => sub.active).map((sub: any) => (
          <SubscriptionCard key={sub.id} subscription={sub} />
        ))}
        {subscriptions.filter((sub: any) => sub.active).length === 0 && (
          <SubscriptionCard subscription={null as any} />
        )}
      </div>
    </div>
  );
}
