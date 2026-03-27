import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMemberPayments } from "@/lib/queries/member";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, CheckCircle2, Clock, XCircle, CreditCard, Download } from "lucide-react";

export const metadata = {
  title: "My Payments | Gym SaaS",
};

export default async function PaymentsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !(session.user as any).id) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  if (role !== "MEMBER" && role !== "GYM_OWNER" && role !== "SUPER_ADMIN" && role !== "TRAINER") {
    redirect("/login");
  }

  const payments = await getMemberPayments((session.user as any).id);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
        <p className="text-muted-foreground">View your recent transactions and billing history.</p>
      </div>

      <div className="space-y-4">
        {payments.length === 0 ? (
          <Card className="border-dashed bg-muted/20">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-3">
              <div className="p-4 bg-muted/50 rounded-full">
                <Receipt className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No payments found</p>
              <p className="text-xs text-muted-foreground">You don&apos;t have any transaction history yet.</p>
            </CardContent>
          </Card>
        ) : (
          payments.map((payment) => {
            let StatusIcon = Clock;
            let statusColor = "text-yellow-600 bg-yellow-500/10 border-yellow-500/20";
            
            if (payment.status === "SUCCESS") {
              StatusIcon = CheckCircle2;
              statusColor = "text-emerald-600 bg-emerald-500/10 border-emerald-500/20";
            } else if (payment.status === "FAILED") {
              StatusIcon = XCircle;
              statusColor = "text-red-600 bg-red-500/10 border-red-500/20";
            }

            return (
              <Card key={payment.id} className="overflow-hidden hover:shadow-sm transition-shadow">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-xl shrink-0">
                        <CreditCard className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-xl text-foreground">
                          ₹{payment.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
                          <span className="font-medium text-foreground/80">{payment.subscription?.plan.name || "Membership Plan"}</span>
                          &bull;
                          <span>{new Date(payment.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                      <Badge variant="outline" className={`ml-auto sm:ml-0 font-medium px-3 py-1.5 flex items-center gap-1.5 ${statusColor}`}>
                        <StatusIcon className="w-4 h-4" />
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="bg-muted/30 px-5 py-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="uppercase tracking-wide font-semibold text-foreground/60">Method: {payment.paymentMethod}</span>
                      <span className="font-mono bg-muted/50 px-2 py-1 rounded hidden sm:inline-block max-w-[150px] truncate">ID: {payment.id}</span>
                    </div>
                    {payment.status === "SUCCESS" && (
                      <a 
                        href={`/api/payments/${payment.id}/receipt`}
                        target="_blank"
                        className="flex items-center gap-1.5 text-primary hover:underline font-medium"
                      >
                        <Download className="w-4 h-4" /> Download Receipt
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
