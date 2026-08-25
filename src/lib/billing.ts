import { GST_RATE, PACKAGING_FEE } from "@/lib/serviceability";

/**
 * Pure bill arithmetic — no DB access, so the exact same function runs
 * client-side (the cart drawer's live preview) and server-side (the
 * order-creation action, which never trusts a client-computed total).
 * `deliveryFee` and `discountAmount` are passed in already resolved
 * (from serviceability + coupon lookups) rather than computed here.
 */
export type BillInput = {
  itemTotal: number;
  deliveryFee: number;
  discountAmount: number;
  /** Packaging is skipped for pickup orders — nothing to box for transit. */
  isPickup?: boolean;
};

export type Bill = {
  itemTotal: number;
  packagingFee: number;
  deliveryFee: number;
  discountAmount: number;
  gstAmount: number;
  grandTotal: number;
};

export function computeBill({ itemTotal, deliveryFee, discountAmount, isPickup }: BillInput): Bill {
  const packagingFee = isPickup ? 0 : PACKAGING_FEE;
  const discountedItemTotal = Math.max(itemTotal - discountAmount, 0);
  const gstAmount = Math.round(discountedItemTotal * GST_RATE);
  const grandTotal = discountedItemTotal + packagingFee + deliveryFee + gstAmount;

  return {
    itemTotal,
    packagingFee,
    deliveryFee,
    discountAmount,
    gstAmount,
    grandTotal,
  };
}
