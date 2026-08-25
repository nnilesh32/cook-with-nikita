import type { Fulfilment, OrderStatus } from "@/generated/prisma/client";

/**
 * Shared status vocabulary for order history (/account) and the public
 * tracker (/track/[id]). Pickup orders skip "Out for delivery" in favour
 * of "Ready for pickup"; delivery orders skip the separate "Ready" step.
 */
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  RECEIVED: "Received",
  ACCEPTED: "Accepted",
  COOKING: "Cooking",
  READY: "Ready for pickup",
  OUT_FOR_DELIVERY: "Out for delivery",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const ORDER_STATUS_DESCRIPTION: Record<OrderStatus, string> = {
  RECEIVED: "Your order's in — I'll confirm it shortly.",
  ACCEPTED: "I've taken your order and it's queued for the kitchen.",
  COOKING: "It's on the stove right now.",
  READY: "Packed and waiting for you at the kitchen.",
  OUT_FOR_DELIVERY: "On its way to you.",
  COMPLETED: "Delivered — hope you loved it.",
  CANCELLED: "This order was cancelled.",
};

export function statusTimeline(fulfilment: Fulfilment): OrderStatus[] {
  return fulfilment === "PICKUP"
    ? ["RECEIVED", "ACCEPTED", "COOKING", "READY", "COMPLETED"]
    : ["RECEIVED", "ACCEPTED", "COOKING", "OUT_FOR_DELIVERY", "COMPLETED"];
}

export function statusIndex(status: OrderStatus, fulfilment: Fulfilment): number {
  return statusTimeline(fulfilment).indexOf(status);
}

/** Cancellation is only offered while the kitchen hasn't started on it. */
export function isCancellable(status: OrderStatus): boolean {
  return status === "RECEIVED";
}

/** The next status in an order's life, given its fulfilment — used by
 * the admin kanban board's single "advance" action per card. `null` once
 * an order's reached a terminal state. */
export function nextStatus(status: OrderStatus, fulfilment: Fulfilment): OrderStatus | null {
  const timeline = statusTimeline(fulfilment);
  const index = timeline.indexOf(status);
  if (index === -1 || index === timeline.length - 1) return null;
  return timeline[index + 1];
}

export const ORDER_STATUS_BADGE_CLASS: Record<OrderStatus, string> = {
  RECEIVED: "bg-steel/20 text-ink",
  ACCEPTED: "bg-turmeric/20 text-ink",
  COOKING: "bg-turmeric/30 text-ink",
  READY: "bg-coriander/20 text-coriander",
  OUT_FOR_DELIVERY: "bg-coriander/20 text-coriander",
  COMPLETED: "bg-coriander/30 text-coriander",
  CANCELLED: "bg-kashmiri/15 text-kashmiri",
};
