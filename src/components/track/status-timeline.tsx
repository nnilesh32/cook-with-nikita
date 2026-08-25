import { Check } from "lucide-react";

import type { Fulfilment, OrderStatus } from "@/generated/prisma/client";
import { ORDER_STATUS_DESCRIPTION, ORDER_STATUS_LABEL, statusIndex, statusTimeline } from "@/lib/order-status";
import { cn } from "@/lib/utils";

export function StatusTimeline({ status, fulfilment }: { status: OrderStatus; fulfilment: Fulfilment }) {
  if (status === "CANCELLED") {
    return (
      <div className="rounded-2xl border border-kashmiri/30 bg-kashmiri/5 p-5 text-sm text-kashmiri">
        This order was cancelled.
      </div>
    );
  }

  const steps = statusTimeline(fulfilment);
  const currentIndex = statusIndex(status, fulfilment);

  return (
    <ol className="flex flex-col gap-0">
      {steps.map((step, i) => {
        const done = i < currentIndex;
        const current = i === currentIndex;
        const isLast = i === steps.length - 1;
        return (
          <li key={step} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                  done && "border-coriander bg-coriander text-bone",
                  current && "border-coriander bg-bone text-coriander ring-2 ring-coriander/30",
                  !done && !current && "border-steel/50 bg-bone text-ink/30"
                )}
              >
                {done ? <Check className="size-3.5" /> : i + 1}
              </span>
              {!isLast && (
                <span className={cn("w-px flex-1 min-h-8", done ? "bg-coriander" : "bg-steel/40")} />
              )}
            </div>
            <div className={cn("pb-8", isLast && "pb-0")}>
              <p className={cn("text-sm font-medium", done || current ? "text-ink" : "text-ink/40")}>
                {ORDER_STATUS_LABEL[step]}
              </p>
              {current && <p className="mt-0.5 text-xs text-ink/60">{ORDER_STATUS_DESCRIPTION[step]}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
