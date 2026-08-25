import { formatINR } from "@/lib/currency";
import { MINIMUM_ORDER_VALUE } from "@/lib/serviceability";
import { cn } from "@/lib/utils";

/** "Minimum order value for delivery, shown as a progress line in the
 * cart" — pickup has no minimum, so this only ever encourages, never
 * blocks. */
export function MinOrderProgress({ itemTotal, className }: { itemTotal: number; className?: string }) {
  if (itemTotal >= MINIMUM_ORDER_VALUE) {
    return (
      <p className={cn("text-xs text-coriander", className)}>
        You&apos;re over the {formatINR(MINIMUM_ORDER_VALUE)} minimum for delivery.
      </p>
    );
  }

  const remaining = MINIMUM_ORDER_VALUE - itemTotal;
  const percent = Math.min((itemTotal / MINIMUM_ORDER_VALUE) * 100, 100);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <p className="text-xs text-ink/60">
        Add <span className="font-medium text-ink">{formatINR(remaining)}</span> more for delivery — pickup has no
        minimum.
      </p>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-turmeric transition-all duration-300" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
