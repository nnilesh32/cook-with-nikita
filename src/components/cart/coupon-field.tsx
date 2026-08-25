"use client";

import { Loader2, Tag, X } from "lucide-react";
import { useState, useTransition } from "react";

import { validateCouponAction } from "@/app/actions/checkout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/stores/cart-store";

export function CouponField({ itemTotal, phone }: { itemTotal: number; phone?: string }) {
  const coupon = useCartStore((state) => state.coupon);
  const setCoupon = useCartStore((state) => state.setCoupon);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleApply() {
    if (!code.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await validateCouponAction({ code, itemTotal, phone });
      if (!result.valid) {
        setError(result.reason);
        return;
      }
      setCoupon({
        code: result.coupon.code,
        discountAmount: result.coupon.discountAmount,
        freeDelivery: result.coupon.freeDelivery,
        message: result.coupon.message,
      });
      setCode("");
    });
  }

  if (coupon) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-coriander/40 bg-coriander/10 px-3 py-2">
        <span className="flex items-center gap-2 text-sm text-ink">
          <Tag className="size-4 text-coriander" />
          <span className="font-mono">{coupon.code}</span> — {coupon.message}
        </span>
        <button
          type="button"
          onClick={() => setCoupon(null)}
          aria-label="Remove coupon"
          className="text-ink/40 hover:text-kashmiri"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApply())}
          placeholder="Coupon code"
          aria-label="Coupon code"
          className="font-mono uppercase"
        />
        <Button type="button" variant="outline" onClick={handleApply} disabled={isPending || !code.trim()}>
          {isPending ? <Loader2 className="size-4 animate-spin" /> : "Apply"}
        </Button>
      </div>
      {error && <p className="text-xs text-kashmiri">{error}</p>}
    </div>
  );
}
