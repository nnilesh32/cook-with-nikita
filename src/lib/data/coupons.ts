import "server-only";

import type { Coupon, CouponType, Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";

export type CouponApplication = {
  code: string;
  type: CouponType;
  discountAmount: number;
  freeDelivery: boolean;
  message: string;
};

export type CouponValidationResult = { valid: true; coupon: CouponApplication } | { valid: false; reason: string };

/**
 * Validates a coupon against everything we can check with what's known
 * at the time it's applied. `phone` is optional — the cart's coupon
 * field is filled in before checkout asks for a phone number, so a
 * first-order-only code can't be fully confirmed yet. It gets checked
 * again, authoritatively, in the order-creation action.
 */
export async function validateCoupon(
  rawCode: string,
  itemTotal: number,
  phone?: string
): Promise<CouponValidationResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { valid: false, reason: "Enter a code." };

  const coupon = await db.coupon.findUnique({ where: { code } });
  if (!coupon) return { valid: false, reason: "That code doesn't exist." };
  if (!coupon.isActive) return { valid: false, reason: "That code isn't active anymore." };
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return { valid: false, reason: "That code has expired." };
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, reason: "That code has been fully redeemed." };
  }
  if (coupon.minOrderValue != null && itemTotal < coupon.minOrderValue) {
    return { valid: false, reason: `Add ₹${coupon.minOrderValue - itemTotal} more to use this code.` };
  }
  if (coupon.firstOrderOnly && phone) {
    const priorOrder = await db.order.findFirst({ where: { guestPhone: phone } });
    if (priorOrder) return { valid: false, reason: "That code is for first orders only." };
  }

  return { valid: true, coupon: describeCoupon(coupon, itemTotal) };
}

function describeCoupon(coupon: Coupon, itemTotal: number): CouponApplication {
  if (coupon.type === "FREE_DELIVERY") {
    return {
      code: coupon.code,
      type: coupon.type,
      discountAmount: 0,
      freeDelivery: true,
      message: "Free delivery applied.",
    };
  }
  if (coupon.type === "PERCENTAGE") {
    const discountAmount = Math.round((itemTotal * coupon.value) / 100);
    return {
      code: coupon.code,
      type: coupon.type,
      discountAmount,
      freeDelivery: false,
      message: `${coupon.value}% off applied.`,
    };
  }
  // FLAT
  const discountAmount = Math.min(coupon.value, itemTotal);
  return {
    code: coupon.code,
    type: coupon.type,
    discountAmount,
    freeDelivery: false,
    message: `₹${coupon.value} off applied.`,
  };
}

/** The authoritative, phone-aware re-check run at order-creation time —
 * read-only, safe to call before an order exists. Consuming a use
 * (below) is a separate step so it can happen inside the same
 * transaction as the order row itself. */
export async function revalidateCoupon(
  rawCode: string,
  itemTotal: number,
  phone: string
): Promise<CouponValidationResult> {
  return validateCoupon(rawCode, itemTotal, phone);
}

/**
 * Atomically increments usedCount only if the coupon is still under
 * maxUses, in one conditional UPDATE — not a separate read-then-write,
 * which would let two concurrent orders on a coupon's last remaining use
 * both pass a prior check and both increment, exceeding maxUses.
 * `maxUses` itself is never edited after a coupon's created (no admin
 * action changes it), so reading it once outside the transaction and
 * using it as a literal in the conditional update is safe.
 *
 * Call this from inside the same `tx` that creates the order using the
 * coupon, after the order row exists — never before, and never outside
 * a transaction — so a failure anywhere in order creation rolls the
 * consumption back too, instead of burning a use with no order to show
 * for it.
 */
export async function consumeCoupon(
  tx: Prisma.TransactionClient,
  code: string,
  maxUses: number | null
): Promise<{ consumed: true } | { consumed: false }> {
  const result = await tx.coupon.updateMany({
    where: {
      code,
      isActive: true,
      ...(maxUses != null ? { usedCount: { lt: maxUses } } : {}),
    },
    data: { usedCount: { increment: 1 } },
  });
  return result.count > 0 ? { consumed: true } : { consumed: false };
}
