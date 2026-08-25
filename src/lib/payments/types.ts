/**
 * Payment abstraction. Two implementations: MockProvider (default —
 * always succeeds after a short delay, zero setup) and RazorpayProvider
 * (test mode, needs real keys, falls back to Mock when they're absent).
 *
 * Razorpay's actual flow is two-phase — the server creates a Razorpay
 * order, the client opens Razorpay's Checkout modal against it, and the
 * server verifies the signature Razorpay hands back — so `charge` can
 * resolve immediately ("paid") or ask the caller to complete a client
 * step first ("requires_client_action"). Mock always takes the first
 * path; COD never touches this interface at all (it's not a payment,
 * it's a promise to pay on delivery), and is handled directly in the
 * order-creation action.
 */

export type ChargeInput = {
  orderId: string;
  orderNumber: string;
  amountInRupees: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
};

export type RazorpayCheckoutConfig = {
  keyId: string;
  razorpayOrderId: string;
  amount: number; // paise, as Razorpay's API expects
  currency: "INR";
  name: string;
  description: string;
  prefill: { name: string; contact: string; email?: string };
};

export type ChargeResult =
  | { status: "paid"; reference: string }
  | { status: "requires_client_action"; checkout: RazorpayCheckoutConfig }
  | { status: "failed"; reason: string };

export type VerifyInput = {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};

export type VerifyResult = { success: true; reference: string } | { success: false; reason: string };

export interface PaymentProvider {
  readonly id: "mock" | "razorpay";
  charge(input: ChargeInput): Promise<ChargeResult>;
  verify(input: VerifyInput): Promise<VerifyResult>;
}
