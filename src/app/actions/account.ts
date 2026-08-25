"use server";

import { buildLineId } from "@/lib/cart-utils";
import { db } from "@/lib/db";
import { isCancellable } from "@/lib/order-status";

/**
 * Turns a past order back into cart lines, priced at today's rates (not
 * the historical snapshot) — the menu moves, and checkout's own
 * validateCart() would reject stale prices anyway. Items that have since
 * gone unavailable are silently skipped and named in the response so the
 * UI can say so.
 */
export async function reorderAction(orderId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
          options: { include: { addOn: true } },
        },
      },
    },
  });
  if (!order) return { success: false as const, error: "That order couldn't be found." };

  const lines: Array<{
    id: string;
    productId: string;
    variantId?: string | null;
    addOnIds: string[];
    spiceLevel: number | null;
    name: string;
    image: string;
    unitPrice: number;
    quantity: number;
    options: Array<{ label: string; priceDelta: number }>;
    note?: string;
  }> = [];
  const skipped: string[] = [];

  for (const item of order.items) {
    if (!item.product.isAvailable) {
      skipped.push(item.product.name);
      continue;
    }
    const addOnIds = item.options.map((o) => o.addOnId).filter((id): id is string => Boolean(id));
    const addOnsTotal = item.options.reduce((sum, o) => sum + (o.addOn?.price ?? o.priceDelta), 0);
    const unitPrice = item.product.basePrice + (item.variant?.priceDelta ?? 0) + addOnsTotal;

    lines.push({
      // Same id format the rest of the app uses to add to cart
      // (lib/cart-utils.ts) — a hand-rolled format here previously meant
      // reordering something already in the cart created a duplicate
      // line instead of the store's usual merge-by-id bumping quantity.
      id: buildLineId(item.productId, item.variantId, addOnIds, item.spiceLevel),
      productId: item.productId,
      variantId: item.variantId,
      addOnIds,
      spiceLevel: item.spiceLevel,
      name: item.product.name + (item.variant ? ` (${item.variant.label})` : ""),
      image: item.product.image,
      unitPrice,
      quantity: item.quantity,
      options: item.options.map((o) => ({ label: o.label, priceDelta: o.addOn?.price ?? o.priceDelta })),
      note: item.specialInstructions ?? undefined,
    });
  }

  return { success: true as const, lines, skipped };
}

export async function cancelOrderAction(orderId: string) {
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return { success: false as const, error: "That order couldn't be found." };
  if (!isCancellable(order.status)) {
    return { success: false as const, error: "This order's already being cooked — message the kitchen to change it." };
  }
  await db.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } });
  return { success: true as const };
}
