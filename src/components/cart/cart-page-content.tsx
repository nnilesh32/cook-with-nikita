"use client";

import Link from "next/link";

import { CartLineList } from "@/components/cart/cart-line-list";
import { CouponField } from "@/components/cart/coupon-field";
import { MinOrderProgress } from "@/components/cart/min-order-progress";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/currency";
import { useCartStore, useCartSubtotal } from "@/stores/cart-store";

export function CartPageContent() {
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const lines = useCartStore((state) => state.lines);
  const subtotal = useCartSubtotal();
  const coupon = useCartStore((state) => state.coupon);

  if (!hasHydrated) {
    return null;
  }

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-steel/60 py-24 text-center">
        <p className="text-lg font-medium text-ink">Your cart&apos;s empty.</p>
        <p className="max-w-sm text-sm text-ink/60">The kitchen&apos;s ready when you are.</p>
        <Button size="lg" className="mt-2" render={<Link href="/menu" />}>
          Browse the menu
        </Button>
      </div>
    );
  }

  const discount = coupon?.discountAmount ?? 0;
  const estimatedTotal = Math.max(subtotal - discount, 0);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <div>
        <CartLineList lines={lines} showImage />
      </div>

      <div className="flex h-fit flex-col gap-5 rounded-2xl border border-steel/50 bg-card p-5 lg:sticky lg:top-24">
        <MinOrderProgress itemTotal={subtotal} />
        <CouponField itemTotal={subtotal} />

        <div className="flex flex-col gap-2 border-t border-steel/40 pt-4 font-mono text-sm">
          <div className="flex items-center justify-between">
            <span className="text-ink/60">Item total</span>
            <span className="text-ink">{formatINR(subtotal)}</span>
          </div>
          {coupon && (
            <div className="flex items-center justify-between text-coriander">
              <span>Coupon ({coupon.code})</span>
              <span>−{formatINR(discount)}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-base font-medium">
            <span className="text-ink">Estimated total</span>
            <span className="text-ink">{formatINR(estimatedTotal)}</span>
          </div>
          <p className="font-sans text-[0.7rem] text-ink/40">
            Packaging, delivery fee and GST are calculated at checkout.
          </p>
        </div>

        <Button size="xl" className="w-full" render={<Link href="/checkout" />}>
          Proceed to checkout
        </Button>
      </div>
    </div>
  );
}
