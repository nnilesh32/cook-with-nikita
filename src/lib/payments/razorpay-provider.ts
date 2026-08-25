import "server-only";

import { createHmac } from "node:crypto";

import { MockProvider } from "@/lib/payments/mock-provider";
import type { ChargeInput, ChargeResult, PaymentProvider, VerifyInput, VerifyResult } from "@/lib/payments/types";

const RAZORPAY_API = "https://api.razorpay.com/v1";

/**
 * Test-mode Razorpay. Falls back to MockProvider whenever
 * RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET aren't set — which is the
 * default, so nobody needs a Razorpay account to run this project.
 *
 * The real flow: `charge` creates a Razorpay order and hands back
 * enough config for the client to open Razorpay's Checkout modal
 * (see `components/checkout/razorpay-checkout-button.tsx`); Razorpay
 * calls back with a payment id + signature, which `verify` checks
 * against the key secret before the order is marked paid. This has
 * never been run against a live Razorpay account in this build — there
 * are no test keys in this environment — so treat it as a correct,
 * unexercised implementation rather than a proven one. See README.md
 * "Going live with Razorpay" before trusting it with real money.
 */
export class RazorpayProvider implements PaymentProvider {
  readonly id = "razorpay" as const;

  private get keyId() {
    return process.env.RAZORPAY_KEY_ID;
  }

  private get keySecret() {
    return process.env.RAZORPAY_KEY_SECRET;
  }

  private get configured() {
    return Boolean(this.keyId && this.keySecret);
  }

  async charge(input: ChargeInput): Promise<ChargeResult> {
    if (!this.configured) {
      return new MockProvider().charge(input);
    }

    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64");
    const amountInPaise = Math.round(input.amountInRupees * 100);

    const response = await fetch(`${RAZORPAY_API}/orders`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: input.orderNumber,
        notes: { orderId: input.orderId },
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      return { status: "failed", reason: `Razorpay order creation failed: ${response.status} ${body}` };
    }

    const razorpayOrder = (await response.json()) as { id: string };

    return {
      status: "requires_client_action",
      checkout: {
        keyId: this.keyId!,
        razorpayOrderId: razorpayOrder.id,
        amount: amountInPaise,
        currency: "INR",
        name: "Cook with Nikita",
        description: `Order ${input.orderNumber}`,
        prefill: { name: input.customerName, contact: input.customerPhone, email: input.customerEmail },
      },
    };
  }

  async verify(input: VerifyInput): Promise<VerifyResult> {
    if (!this.configured) {
      return new MockProvider().verify(input);
    }

    const expected = createHmac("sha256", this.keySecret!)
      .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
      .digest("hex");

    if (expected !== input.razorpaySignature) {
      return { success: false, reason: "Signature mismatch" };
    }

    return { success: true, reference: input.razorpayPaymentId };
  }
}
