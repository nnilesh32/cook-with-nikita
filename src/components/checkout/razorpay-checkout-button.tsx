"use client";

import { useState } from "react";

import { confirmRazorpayPaymentAction } from "@/app/actions/checkout";
import { Button } from "@/components/ui/button";
import type { RazorpayCheckoutConfig } from "@/lib/payments";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadRazorpayScript() {
  scriptPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Couldn't load Razorpay's checkout script."));
    document.body.appendChild(script);
  });
  return scriptPromise;
}

/**
 * Only rendered when RazorpayProvider actually created a live order,
 * which only happens with real test keys configured — this path has
 * never run against a real Razorpay account in this build. Opens
 * Razorpay's own Checkout modal, then hands the result to
 * `confirmRazorpayPaymentAction` for signature verification.
 */
export function RazorpayCheckoutButton({
  orderId,
  orderNumber,
  checkout,
  onVerified,
  onError,
}: {
  orderId: string;
  orderNumber: string;
  checkout: RazorpayCheckoutConfig;
  onVerified: (result: { orderId: string; orderNumber: string }) => void;
  onError: (message: string) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    setIsLoading(true);
    try {
      await loadRazorpayScript();
      const razorpay = new window.Razorpay({
        key: checkout.keyId,
        amount: checkout.amount,
        currency: checkout.currency,
        name: checkout.name,
        description: checkout.description,
        order_id: checkout.razorpayOrderId,
        prefill: checkout.prefill,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const result = await confirmRazorpayPaymentAction({
            orderId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          if (result.success) {
            onVerified({ orderId: result.orderId, orderNumber: result.orderNumber });
          } else {
            onError(result.error);
          }
        },
        modal: {
          ondismiss: () => setIsLoading(false),
        },
      });
      razorpay.open();
    } catch (error) {
      onError(error instanceof Error ? error.message : "Couldn't open the payment window.");
      setIsLoading(false);
    }
  }

  return (
    <Button size="xl" className="w-full" onClick={handleClick} disabled={isLoading}>
      {isLoading ? "Opening payment window…" : `Pay for order ${orderNumber}`}
    </Button>
  );
}
