"use client";

import Link from "next/link";
import type { UseFormReturn } from "react-hook-form";

import type { CheckoutValues } from "@/components/checkout/checkout-schema";
import { cn } from "@/lib/utils";

const OPTIONS = [
  {
    value: "ONLINE" as const,
    title: "Pay online",
    description: "Card, UPI or netbanking — test mode, no real charge goes through.",
  },
  {
    value: "COD" as const,
    title: "Cash on delivery",
    description: "Keep the exact amount ready — payment is on arrival.",
  },
];

export function StepPayment({ form }: { form: UseFormReturn<CheckoutValues> }) {
  const paymentMethod = form.watch("paymentMethod");

  return (
    <div className="flex flex-col gap-6">
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-1 text-sm font-medium text-ink">How will you pay?</legend>
        {OPTIONS.map((option) => {
          const isActive = paymentMethod === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                "cursor-pointer rounded-2xl border p-5 transition-colors",
                isActive ? "border-turmeric bg-turmeric/10" : "border-steel/50 hover:border-steel"
              )}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={option.value}
                checked={isActive}
                onChange={() => form.setValue("paymentMethod", option.value, { shouldValidate: true })}
                className="sr-only"
              />
              <p className="text-lg font-medium text-ink">{option.title}</p>
              <p className="mt-1 text-sm text-ink/60">{option.description}</p>
            </label>
          );
        })}
      </fieldset>

      <p className="text-xs text-ink/50">
        By placing this order you agree to the{" "}
        <Link href="/terms" className="underline decoration-steel underline-offset-2 hover:text-ink">
          terms
        </Link>{" "}
        and{" "}
        <Link href="/refund-policy" className="underline decoration-steel underline-offset-2 hover:text-ink">
          refund policy
        </Link>
        .
      </p>
    </div>
  );
}
