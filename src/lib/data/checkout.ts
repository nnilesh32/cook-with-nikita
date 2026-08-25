import "server-only";

import { format } from "date-fns";

import type { Fulfilment, Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { addDays, isPastCutoff, isWeeklyOpenDay, todayIso } from "@/lib/kitchen";

// ---------------------------------------------------------------------------
// Available dates
// ---------------------------------------------------------------------------

export type AvailableDate = { date: string; label: string };

/** Which of the next couple of weeks the kitchen can actually take this
 * order for — weekly closed days, one-off holidays, the 8pm cutoff for
 * same-day orders, and a day's notice for anything in the cart that
 * needs it. */
export async function getAvailableDates(requiresNextDay: boolean, daysAhead = 14): Promise<AvailableDate[]> {
  const now = new Date();
  const holidays = await db.kitchenHoliday.findMany({
    where: { date: { gte: new Date(now.toDateString()) } },
  });
  const holidaySet = new Set(holidays.map((h) => todayIso(h.date)));

  const startOffset = requiresNextDay || isPastCutoff(now) ? 1 : 0;
  const dates: AvailableDate[] = [];

  for (let i = startOffset; i <= daysAhead; i++) {
    const d = addDays(now, i);
    if (!isWeeklyOpenDay(d)) continue;
    const iso = todayIso(d);
    if (holidaySet.has(iso)) continue;
    dates.push({ date: iso, label: format(d, "EEE, MMM d") });
  }

  return dates;
}

// ---------------------------------------------------------------------------
// Slot availability
// ---------------------------------------------------------------------------

export type SlotAvailability = {
  id: string;
  label: string;
  remaining: number;
  capacity: number;
};

export async function getSlotAvailability(date: string, fulfilment: Fulfilment): Promise<SlotAvailability[]> {
  const slots = await db.timeSlot.findMany({
    where: { isActive: true, OR: [{ fulfilment }, { fulfilment: null }] },
    orderBy: { sortOrder: "asc" },
  });

  const bookedCounts = await db.order.groupBy({
    by: ["slotId"],
    where: { scheduledDate: date, status: { not: "CANCELLED" }, slotId: { not: null } },
    _count: { _all: true },
  });
  const bookedMap = new Map(bookedCounts.map((row) => [row.slotId, row._count._all]));

  return slots.map((slot) => ({
    id: slot.id,
    label: slot.label,
    capacity: slot.capacity,
    remaining: Math.max(slot.capacity - (bookedMap.get(slot.id) ?? 0), 0),
  }));
}

// ---------------------------------------------------------------------------
// Cart revalidation — never trust client-computed prices at checkout
// ---------------------------------------------------------------------------

export type CartLineInput = {
  id: string;
  productId: string;
  variantId?: string | null;
  addOnIds?: string[];
  quantity: number;
};

export type CartLineValidation = {
  id: string;
  productId: string;
  name: string;
  ok: boolean;
  authoritativeUnitPrice: number;
  requestedQuantity: number;
  allowedQuantity: number;
  /** 0 = same-day, 24 = needs a day's notice — the checkout date step
   * needs the worst case across the whole cart. */
  leadTimeHours: number;
  issue?: "unavailable" | "sold_out" | "price_changed" | "quantity_reduced";
};

export async function validateCart(lines: CartLineInput[]): Promise<CartLineValidation[]> {
  const today = todayIso();
  const results: CartLineValidation[] = [];

  for (const line of lines) {
    const product = await db.product.findUnique({
      where: { id: line.productId },
      include: { variants: true, addOns: true },
    });

    if (!product || !product.isAvailable) {
      results.push({
        id: line.id,
        productId: line.productId,
        name: product?.name ?? "This item",
        ok: false,
        authoritativeUnitPrice: 0,
        requestedQuantity: line.quantity,
        allowedQuantity: 0,
        leadTimeHours: 0,
        issue: "unavailable",
      });
      continue;
    }

    const variant = line.variantId ? product.variants.find((v) => v.id === line.variantId) : null;
    const addOns = product.addOns.filter((a) => line.addOnIds?.includes(a.id));
    const authoritativeUnitPrice =
      product.basePrice + (variant?.priceDelta ?? 0) + addOns.reduce((sum, a) => sum + a.price, 0);

    let allowedQuantity = line.quantity;
    if (product.dailyLimit != null) {
      const soldToday = await db.orderItem.aggregate({
        _sum: { quantity: true },
        where: {
          productId: product.id,
          order: { scheduledDate: today, status: { not: "CANCELLED" } },
        },
      });
      const remaining = Math.max(product.dailyLimit - (soldToday._sum.quantity ?? 0), 0);
      allowedQuantity = Math.min(line.quantity, remaining);
    }

    if (allowedQuantity === 0) {
      results.push({
        id: line.id,
        productId: line.productId,
        name: product.name,
        ok: false,
        authoritativeUnitPrice,
        requestedQuantity: line.quantity,
        allowedQuantity: 0,
        leadTimeHours: product.leadTimeHours,
        issue: "sold_out",
      });
      continue;
    }

    const ok = allowedQuantity === line.quantity;
    results.push({
      id: line.id,
      productId: line.productId,
      name: product.name,
      ok,
      authoritativeUnitPrice,
      requestedQuantity: line.quantity,
      allowedQuantity,
      leadTimeHours: product.leadTimeHours,
      issue: ok ? undefined : "quantity_reduced",
    });
  }

  return results;
}

/**
 * Re-checks one product's daily-limit headroom from inside the order-
 * creation transaction, right before the order is committed.
 *
 * validateCart() above does the same aggregate-and-compare, but as a
 * plain read well before the order exists — two carts both checking out
 * near a dish's last few portions can both pass that check before
 * either commits, oversubscribing the limit. Running the read again
 * here, inside the same `tx` that's about to create the order, closes
 * that gap on SQLite: it only allows one writer transaction at a time,
 * so a concurrent order's re-check here genuinely sees this one's rows
 * once this one commits (or doesn't run until this one's done).
 *
 * NB: like validateCart(), this is scoped to *today* regardless of the
 * order's chosen scheduledDate — fine while every dailyLimit product in
 * the seed data has leadTimeHours 0 (same-day only), but if a future
 * next-day-notice dish ever gets a dailyLimit too, this needs a
 * scheduledDate parameter instead of always reading today's sales.
 */
export async function hasDailyLimitHeadroom(
  tx: Prisma.TransactionClient,
  productId: string,
  dailyLimit: number,
  requestedQuantity: number
): Promise<boolean> {
  const today = todayIso();
  const soldToday = await tx.orderItem.aggregate({
    _sum: { quantity: true },
    where: { productId, order: { scheduledDate: today, status: { not: "CANCELLED" } } },
  });
  const remaining = Math.max(dailyLimit - (soldToday._sum.quantity ?? 0), 0);
  return requestedQuantity <= remaining;
}
