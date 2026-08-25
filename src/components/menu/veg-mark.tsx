import type { VegType } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

const LABEL: Record<VegType, string> = {
  VEG: "Vegetarian",
  NON_VEG: "Non-vegetarian",
  JAIN: "Jain — vegetarian, no onion or garlic",
};

/** The square-with-a-dot mark used on Indian food packaging: green for
 * veg, red-brown for non-veg. Jain gets the veg mark plus a text badge,
 * since it's a vegetarian subset rather than a third colour. */
export function VegMark({ vegType, className }: { vegType: VegType; className?: string }) {
  const isVeg = vegType !== "NON_VEG";
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center border bg-bone",
          isVeg ? "border-coriander" : "border-kashmiri"
        )}
      >
        <span className={cn("size-1.5 rounded-full", isVeg ? "bg-coriander" : "bg-kashmiri")} />
      </span>
      <span className="sr-only">{LABEL[vegType]}</span>
      {vegType === "JAIN" && (
        <span aria-hidden className="font-mono text-[0.6rem] tracking-wide text-ink/50 uppercase">
          Jain
        </span>
      )}
    </span>
  );
}
