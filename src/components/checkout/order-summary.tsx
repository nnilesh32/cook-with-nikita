"use client";

import { formatINR } from "@/lib/currency";
import type { Bill } from "@/lib/billing";
import { useCartStore } from "@/stores/cart-store";

export function OrderSummary({ bill, deliveryKnown }: { bill: Bill; deliveryKnown: boolean }) {
  const lines = useCartStore((state) => state.lines);

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-steel/50 bg-card p-5">
      <p className="text-sm font-medium text-ink">Order summary</p>

      <ul className="flex flex-col gap-3 border-b border-steel/40 pb-4">
        {lines.map((line) => (
          <li key={line.id} className="flex justify-between gap-3 text-sm">
            <span className="text-ink/70">
              {line.quantity} × {line.name}
            </span>
            <span className="shrink-0 font-mono text-ink">{formatINR(line.unitPrice * line.quantity)}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-2 font-mono text-sm">
        <Row label="Item total" value={formatINR(bill.itemTotal)} />
        {bill.packagingFee > 0 && <Row label="Packaging" value={formatINR(bill.packagingFee)} />}
        <Row
          label="Delivery"
          value={deliveryKnown ? (bill.deliveryFee === 0 ? "Free" : formatINR(bill.deliveryFee)) : "—"}
          muted={!deliveryKnown}
        />
        {bill.discountAmount > 0 && (
          <Row label="Discount" value={`−${formatINR(bill.discountAmount)}`} tone="coriander" />
        )}
        <Row label="GST (5%)" value={formatINR(bill.gstAmount)} />
        <div className="mt-1 flex items-center justify-between border-t border-steel/40 pt-2 text-base">
          <span className="font-sans font-medium text-ink">Total</span>
          {/* bill.grandTotal is computed with delivery defaulted to ₹0
              whenever the pincode isn't confirmed serviceable yet — showing
              that number here would understate what's actually owed, so
              show "pending" instead of a wrong total. */}
          <span className="text-ink">{deliveryKnown ? formatINR(bill.grandTotal) : "—"}</span>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  muted,
  tone,
}: {
  label: string;
  value: string;
  muted?: boolean;
  tone?: "coriander";
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-sans text-ink/60">{label}</span>
      <span className={muted ? "text-ink/40" : tone === "coriander" ? "text-coriander" : "text-ink"}>{value}</span>
    </div>
  );
}
