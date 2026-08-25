"use client";

import { useEffect, useState } from "react";
import type { UseFormReturn } from "react-hook-form";

import {
  getAvailableDatesAction,
  getSlotAvailabilityAction,
} from "@/app/actions/checkout";
import type { CheckoutValues } from "@/components/checkout/checkout-schema";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type AvailableDate = { date: string; label: string };
type SlotAvailability = { id: string; label: string; remaining: number; capacity: number };

export function StepSchedule({
  form,
  requiresNextDay,
}: {
  form: UseFormReturn<CheckoutValues>;
  requiresNextDay: boolean;
}) {
  const date = form.watch("date");
  const slotId = form.watch("slotId");
  const fulfilment = form.watch("fulfilment");

  const [dates, setDates] = useState<AvailableDate[] | null>(null);
  const [slots, setSlots] = useState<SlotAvailability[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setDates(null);
    getAvailableDatesAction(requiresNextDay).then((result) => {
      if (cancelled) return;
      setDates(result);
      // If the previously picked date fell out of range (e.g. a cart
      // change now requires a day's notice), clear it so the user picks
      // again rather than silently keeping an invalid date.
      if (date && !result.some((d) => d.date === date)) {
        form.setValue("date", "", { shouldValidate: false });
        form.setValue("slotId", "", { shouldValidate: false });
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requiresNextDay]);

  useEffect(() => {
    if (!date) {
      setSlots(null);
      return;
    }
    let cancelled = false;
    setSlots(null);
    getSlotAvailabilityAction(date, fulfilment).then((result) => {
      if (!cancelled) setSlots(result);
    });
    return () => {
      cancelled = true;
    };
  }, [date, fulfilment]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-3 text-sm font-medium text-ink">Which day?</p>
        {!dates ? (
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-20 shrink-0 rounded-xl" />
            ))}
          </div>
        ) : dates.length === 0 ? (
          <p className="text-sm text-ink/60">
            Nothing bookable in the next couple of weeks — message the kitchen on WhatsApp.
          </p>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {dates.map((d) => {
              const isActive = date === d.date;
              const [weekday, monthDay] = d.label.split(", ");
              return (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => {
                    form.setValue("date", d.date, { shouldValidate: true });
                    form.setValue("slotId", "", { shouldValidate: false });
                  }}
                  className={cn(
                    "flex w-20 shrink-0 flex-col items-center gap-0.5 rounded-xl border px-2 py-3 transition-colors",
                    isActive ? "border-turmeric bg-turmeric/10" : "border-steel/50 hover:border-steel"
                  )}
                >
                  <span className="font-mono text-[0.65rem] text-ink/50 uppercase">{weekday}</span>
                  <span className="text-sm font-medium text-ink">{monthDay}</span>
                </button>
              );
            })}
          </div>
        )}
        {form.formState.errors.date && (
          <p className="mt-2 text-xs text-kashmiri">{form.formState.errors.date.message}</p>
        )}
      </div>

      {date && (
        <div>
          <p className="mb-3 text-sm font-medium text-ink">Which slot?</p>
          {!slots ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <p className="text-sm text-ink/60">No slots configured for that day yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {slots.map((slot) => {
                const isActive = slotId === slot.id;
                const isFull = slot.remaining <= 0;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={isFull}
                    onClick={() => form.setValue("slotId", slot.id, { shouldValidate: true })}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center transition-colors",
                      isFull
                        ? "cursor-not-allowed border-steel/30 opacity-50"
                        : isActive
                          ? "border-turmeric bg-turmeric/10"
                          : "border-steel/50 hover:border-steel"
                    )}
                  >
                    <span className="text-sm font-medium text-ink">{slot.label}</span>
                    <span className="font-mono text-[0.65rem] text-ink/50">
                      {isFull ? "Full" : `${slot.remaining} left`}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          {form.formState.errors.slotId && (
            <p className="mt-2 text-xs text-kashmiri">{form.formState.errors.slotId.message}</p>
          )}
        </div>
      )}
    </div>
  );
}
