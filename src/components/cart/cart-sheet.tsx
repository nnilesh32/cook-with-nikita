"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { CartLineList } from "@/components/cart/cart-line-list";
import { CouponField } from "@/components/cart/coupon-field";
import { MinOrderProgress } from "@/components/cart/min-order-progress";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatINR } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { useCartCount, useCartStore, useCartSubtotal } from "@/stores/cart-store";

export function CartSheet() {
  const count = useCartCount();
  const lines = useCartStore((state) => state.lines);
  const subtotal = useCartSubtotal();
  const isOpen = useCartStore((state) => state.isOpen);
  const setCartOpen = useCartStore((state) => state.setCartOpen);
  const coupon = useCartStore((state) => state.coupon);

  const discount = coupon?.discountAmount ?? 0;
  const estimatedTotal = Math.max(subtotal - discount, 0);

  return (
    <Sheet open={isOpen} onOpenChange={setCartOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
          />
        }
      >
        <span className="relative flex items-center justify-center">
          <ShoppingBag className="size-5" />
          {count > 0 && (
            <span className="absolute -top-2 -right-2 flex size-4 items-center justify-center rounded-full bg-kashmiri font-mono text-[0.6rem] text-white">
              {count}
            </span>
          )}
        </span>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="border-b border-steel/40">
          <SheetTitle>Your cart</SheetTitle>
          <SheetDescription>
            {count === 0
              ? "Nothing here yet."
              : `${count} item${count === 1 ? "" : "s"} · ${formatINR(subtotal)}`}
          </SheetDescription>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="max-w-[22ch] text-sm text-ink/60">
              Your cart&apos;s empty. The kitchen&apos;s ready when you are.
            </p>
            <SheetClose
              nativeButton={false}
              render={<Link href="/menu" />}
              className={buttonVariants({ variant: "default" })}
            >
              Browse the menu
            </SheetClose>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4">
            <CartLineList lines={lines} />
          </div>
        )}

        {lines.length > 0 && (
          <SheetFooter className="gap-4 border-t border-steel/40">
            <MinOrderProgress itemTotal={subtotal} />
            <CouponField itemTotal={subtotal} />
            <div className="flex items-center justify-between font-mono text-sm">
              <span className="text-ink/60">Estimated total</span>
              <span className="text-ink">{formatINR(estimatedTotal)}</span>
            </div>
            <p className="-mt-2 text-[0.7rem] text-ink/40">Delivery fee and GST are added at checkout.</p>
            <SheetClose
              nativeButton={false}
              render={<Link href="/checkout" />}
              className={cn(buttonVariants({ size: "lg" }), "w-full")}
            >
              Checkout
            </SheetClose>
            <SheetClose
              nativeButton={false}
              render={<Link href="/cart" />}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full")}
            >
              View full cart
            </SheetClose>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
