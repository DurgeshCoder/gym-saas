"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";
import toast from "react-hot-toast";

interface RazorpayButtonProps {
  amount: number;
  subscriptionId?: string;
  className?: string;
}

export function RazorpayButton({ amount, subscriptionId, className }: RazorpayButtonProps) {
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);

    try {
      const res = await loadRazorpayScript();

      if (!res) {
        toast.error("Razorpay SDK failed to load. Are you online?");
        setLoading(false);
        return;
      }

      // Create Order
      const orderRes = await fetch("/api/member/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, subscriptionId }),
      });

      if (!orderRes.ok) {
        const errorData = await orderRes.json();
        toast.error(errorData.message || "Something went wrong.");
        setLoading(false);
        return;
      }

      const orderData = await orderRes.json();

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: orderData.gymName,
        description: `Payment for member fees`,
        image: orderData.gymLogo,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/member/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                amount: amount,
                subscriptionId: subscriptionId,
              }),
            });

            if (verifyRes.ok) {
              toast.success("Payment successful!");
              setTimeout(() => {
                window.location.href = "/member/payments";
              }, 1000);
            } else {
              toast.error("Payment verification failed.");
            }
          } catch (error) {
            toast.error("An error occurred during verification.");
          }
        },
        prefill: {
          name: orderData.userName,
          email: orderData.userEmail || "",
          contact: orderData.userPhone || "",
        },
        theme: {
          color: "#0f172a", // You can customize this
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      
      paymentObject.on("payment.failed", function (response: any) {
        toast.error(response.error.description);
      });
      
      paymentObject.open();

    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handlePayment} 
      disabled={loading} 
      className={`gap-2 w-full ${className}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <CreditCard className="w-4 h-4" />
      )}
      Pay Renew Fee (₹{amount})
    </Button>
  );
}
