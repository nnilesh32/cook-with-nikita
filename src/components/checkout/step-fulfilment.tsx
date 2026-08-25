"use client";

import type { UseFormReturn } from "react-hook-form";

import type { CheckoutValues } from "@/components/checkout/checkout-schema";
import { KITCHEN_AREA, MINIMUM_ORDER_VALUE } from "@/lib/serviceability";
import { cn } from "@/lib/utils";

const OPTIONS = [
  {
    value: "DELIVERY" as const,
    title: "Delivery",
    description: `Minimum ₹${MINIMUM_ORDER_VALUE} order, serviceable pincodes only.`,
  },
  {
    value: "PICKUP" as const,
    title: "Pickup",
    description: `Pick up from the kitchen in ${KITCHEN_AREA} — any order size.`,
  },
];

export function StepFulfilment({ form }: { form: UseFormReturn<CheckoutValues> }) {
  const fulfilment = form.watch("fulfilment");

  return (
    <fieldset className="grid gap-4 sm:grid-cols-2">
      <legend className="mb-1 text-sm font-medium text-ink">How would you like it?</legend>
      {OPTIONS.map((option) => {
        const isActive = fulfilment === option.value;
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
              name="fulfilment"
              value={option.value}
              checked={isActive}
              onChange={() => form.setValue("fulfilment", option.value, { shouldValidate: true })}
              className="sr-only"
            />
            <p className="text-lg font-medium text-ink">{option.title}</p>
            <p className="mt-1 text-sm text-ink/60">{option.description}</p>
          </label>
        );
      })}
    </fieldset>
  );
}
