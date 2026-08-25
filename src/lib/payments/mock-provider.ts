import "server-only";

import type { ChargeInput, ChargeResult, PaymentProvider, VerifyInput, VerifyResult } from "@/lib/payments/types";

/** Always succeeds after a short delay — the default, so the app runs
 * end to end with zero payment keys. */
export class MockProvider implements PaymentProvider {
  readonly id = "mock" as const;

  async charge(input: ChargeInput): Promise<ChargeResult> {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return {
      status: "paid",
      reference: `MOCK-${input.orderNumber}-${Date.now().toString(36).toUpperCase()}`,
    };
  }

  async verify(_input: VerifyInput): Promise<VerifyResult> {
    void _input;
    return { success: true, reference: `MOCK-VERIFIED-${Date.now().toString(36).toUpperCase()}` };
  }
}
