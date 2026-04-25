"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CreditCard, Activity, CalendarDays } from "lucide-react";
import { MemberDashboardData } from "@/lib/queries/member";
import { RazorpayButton } from "./RazorpayButton";

type SubscriptionData = NonNullable<MemberDashboardData>["subscription"];

interface SubscriptionCardProps {
  subscription: SubscriptionData;
}

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  if (!subscription) {
    return (
      <Card className="h-full border-dashed">
        <CardContent className="flex flex-col items-center justify-center p-8 h-full text-center space-y-3">
          <div className="p-4 bg-muted/50 rounded-full">
            <CreditCard className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="font-medium text-lg">No Active Subscription</h3>
            <p className="text-sm text-muted-foreground">
              You don&apos;t have an active gym subscription at the moment.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { plan, startDate, endDate, active, payments } = subscription;
  const daysRemaining = Math.max(0, Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)));
  const isExpired = new Date(endDate) < new Date();
  // Show the pay button ONLY when the subscription is active AND not expired
  const canPay = active && !isExpired;
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  };
  const progressPercent = Math.max(
    0,
    Math.min(
      100,
      100 - (daysRemaining / plan.duration) * 100
    )
  );

  let finalPrice = plan.price;
  if (plan.discount && plan.discount > 0) {
    if (plan.discountType === "FIXED") {
      finalPrice = Math.max(0, plan.price - plan.discount);
    } else if (plan.discountType === "PERCENTAGE") {
      finalPrice = Math.max(0, plan.price - (plan.price * plan.discount) / 100);
    }
  }

  return (
    <Card className="h-full relative overflow-hidden flex flex-col">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <CreditCard className="w-32 h-32" />
      </div>
      
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            My Subscription
          </CardTitle>
          <Badge variant={active ? "default" : "secondary"} className={active ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" : ""}>
            {active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-6">
        <div>
          <h4 className="text-3xl font-black mb-1">{plan.name}</h4>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-muted-foreground flex items-end">
              ₹{finalPrice}
              <span className="text-sm font-medium ml-1 pb-1">/{plan.duration} days</span>
            </p>
            {finalPrice < plan.price && (
              <p className="text-sm line-through text-muted-foreground/60">₹{plan.price}</p>
            )}
            {plan.discount > 0 && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-800 ml-2">
                {plan.discountType === "PERCENTAGE" ? `${plan.discount}% OFF` : `₹${plan.discount} OFF`}
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-4 bg-muted/30 p-4 rounded-xl border">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <CalendarDays className="w-4 h-4" /> Start Date
            </span>
            <span className="font-medium">{formatDate(startDate)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" /> End Date
            </span>
            <span className="font-medium">{formatDate(endDate)}</span>
          </div>

          <div className="space-y-2 pt-2 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground font-medium">Time Remaining</span>
              <span className="font-bold text-primary">
                {daysRemaining > 0 ? `${daysRemaining} days left` : "Expired"}
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${daysRemaining <= 7 ? "bg-destructive" : "bg-primary"}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {daysRemaining <= 7 && daysRemaining > 0 && (
              <p className="text-xs text-destructive text-right animate-pulse">
                Expiring soon!
              </p>
            )}
          </div>
          <div className="pt-2">
            {canPay ? (
              <RazorpayButton amount={finalPrice} subscriptionId={subscription.id} />
            ) : (
              <div className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg border border-border/60 bg-muted/40 text-sm font-medium text-muted-foreground cursor-not-allowed select-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                {isExpired ? "Subscription Expired" : "Subscription Inactive"}
              </div>
            )}
          </div>
        </div>

        {payments && payments.length > 0 && (
          <div className="space-y-3">
            <h5 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recent Payment</h5>
            <div className="flex items-center justify-between text-sm p-3 rounded-lg border bg-card">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <CreditCard className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">₹{payments[0].amount}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(payments[0].createdAt)}</p>
                </div>
              </div>
              <Badge variant="outline" className="border-emerald-500/20 text-emerald-500 bg-emerald-500/10">
                {payments[0].status}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
