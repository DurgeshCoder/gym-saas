import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;

        const payment = await prisma.payment.findUnique({
            where: { id },
            include: { 
                user: true, 
                subscription: { include: { plan: true } },
                gym: true 
            }
        });

        if (!payment) {
            return new NextResponse("Not Found", { status: 404 });
        }

        // Basic security check: only the user or gym owner/admin can view it
        if ((session.user as any).role === "MEMBER" && payment.userId !== (session.user as any).id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Generate nice HTML receipt
        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Receipt - ${payment.id}</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    background-color: #f9fafb;
                    color: #111827;
                    line-height: 1.5;
                    padding: 40px 20px;
                    margin: 0;
                }
                .receipt-container {
                    max-width: 650px;
                    margin: 0 auto;
                    background: #ffffff;
                    padding: 50px;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    border-bottom: 2px solid #f3f4f6;
                    padding-bottom: 30px;
                    margin-bottom: 30px;
                }
                .brand h1 {
                    margin: 0;
                    font-size: 28px;
                    color: #059669; /* Emerald 600 */
                }
                .brand p {
                    margin: 4px 0 0 0;
                    color: #6b7280;
                    font-size: 14px;
                }
                .receipt-info {
                    text-align: right;
                }
                .receipt-info h2 {
                    margin: 0;
                    font-size: 24px;
                    font-weight: 300;
                    color: #374151;
                    letter-spacing: 1px;
                }
                .receipt-info p {
                    margin: 4px 0 0 0;
                    color: #6b7280;
                    font-size: 14px;
                }
                .billing-info {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 40px;
                }
                .billing-info h3 {
                    margin: 0 0 8px 0;
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #9ca3af;
                }
                .billing-info p {
                    margin: 0 0 4px 0;
                    font-weight: 500;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 40px;
                }
                th {
                    text-align: left;
                    padding: 12px 0;
                    border-bottom: 2px solid #e5e7eb;
                    color: #6b7280;
                    font-weight: 600;
                    font-size: 14px;
                }
                td {
                    padding: 16px 0;
                    border-bottom: 1px solid #f3f4f6;
                }
                .amount-col {
                    text-align: right;
                }
                .total {
                    font-size: 20px;
                    font-weight: 700;
                    color: #111827;
                }
                .footer {
                    text-align: center;
                    color: #9ca3af;
                    font-size: 14px;
                    margin-top: 50px;
                    border-top: 1px solid #f3f4f6;
                    padding-top: 20px;
                }
                .actions {
                    margin-top: 40px;
                    text-align: center;
                }
                .btn {
                    background-color: #059669;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    font-size: 16px;
                    font-weight: 600;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                .btn:hover {
                    background-color: #047857;
                }
                @media print {
                    body {
                        background-color: #ffffff;
                        padding: 0;
                    }
                    .receipt-container {
                        box-shadow: none;
                        padding: 0;
                        max-width: 100%;
                    }
                    .actions {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="receipt-container">
                <div class="header">
                    <div class="brand">
                        <h1>${payment.gym?.name || "Gym SaaS"}</h1>
                        <p>Official Payment Receipt</p>
                    </div>
                    <div class="receipt-info">
                        <h2>RECEIPT</h2>
                        <p><strong>Date:</strong> ${new Date(payment.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                        <p><strong>ID:</strong> #${payment.id.slice(-8).toUpperCase()}</p>
                    </div>
                </div>

                <div class="billing-info">
                    <div>
                        <h3>Billed To</h3>
                        <p>${payment.user.name}</p>
                        <p style="color: #6b7280; font-weight: 400;">${payment.user.email}</p>
                    </div>
                    <div style="text-align: right;">
                        <h3>Payment Status</h3>
                        <p style="color: #059669;">Success</p>
                        <p style="color: #6b7280; font-weight: 400; font-size: 14px;">Method: ${payment.paymentMethod}</p>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th class="amount-col">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <div style="font-weight: 500;">${payment.subscription?.plan.name || "Membership Plan Payment"}</div>
                                <div style="font-size: 14px; color: #6b7280; margin-top: 4px;">Service Fee</div>
                            </td>
                            <td class="amount-col total">₹${payment.amount.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>

                <div class="footer">
                    <p>Thank you for choosing ${payment.gym?.name || "our gym"}!</p>
                    <p style="font-size: 12px; margin-top: 8px;">If you have any questions concerning this invoice, please contact the gym administration.</p>
                </div>

                <div class="actions">
                    <button class="btn" onclick="window.print()">
                        <svg style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 6px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                        Print / Download PDF
                    </button>
                </div>
            </div>
            <script>
                // Optionally trigger print right away:
                // window.onload = function() { window.print(); }
            </script>
        </body>
        </html>
        `;

        return new NextResponse(html, { 
            headers: { 
                "Content-Type": "text/html" 
            } 
        });
    } catch (error) {
        console.error("Receipt generation error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
