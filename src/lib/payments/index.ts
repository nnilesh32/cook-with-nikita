import "server-only";

import { RazorpayProvider } from "@/lib/payments/razorpay-provider";
import type { PaymentProvider } from "@/lib/payments/types";

export type { ChargeInput, ChargeResult, PaymentProvider, RazorpayCheckoutConfig, VerifyInput, VerifyResult } from "@/lib/payments/types";

/**
 * "Pay online" at checkout always goes through this provider.
 * RazorpayProvider itself falls back to Mock behaviour when no keys
 * are configured, so this returns Razorpay unconditionally — the
 * fallback lives one layer down, not here.
 */
export function getPaymentProvider(): PaymentProvider {
  return new RazorpayProvider();
}
