"use server";

import { z } from "zod";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import type { OrderStatus } from "@/generated/prisma/client";

/** Every action here is a real mutation endpoint, callable directly
 * regardless of which page rendered the button that triggers it — so
 * each one re-checks the admin cookie itself rather than trusting that
 * only an authenticated page could have reached it. */
async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Not authenticated.");
  }
}

const ORDER_STATUSES: OrderStatus[] = [
  "RECEIVED",
  "ACCEPTED",
  "COOKING",
  "READY",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
  "CANCELLED",
];

export async function updateOrderStatusAction(orderId: string, status: OrderStatus) {
  await requireAdmin();
  if (!ORDER_STATUSES.includes(status)) throw new Error("Invalid status.");
  await db.order.update({ where: { id: orderId }, data: { status } });
  return { success: true as const };
}

const productUpdateSchema = z.object({
  id: z.string(),
  isAvailable: z.boolean().optional(),
  isTodaysSpecial: z.boolean().optional(),
  basePrice: z.number().int().min(0).optional(),
  dailyLimit: z.number().int().min(0).nullable().optional(),
});

export async function updateProductAction(input: z.infer<typeof productUpdateSchema>) {
  await requireAdmin();
  const parsed = productUpdateSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, error: "That value doesn't look right." };
  const { id, ...fields } = parsed.data;
  await db.product.update({ where: { id }, data: fields });
  return { success: true as const };
}

const slotUpdateSchema = z.object({
  id: z.string(),
  capacity: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export async function updateTimeSlotAction(input: z.infer<typeof slotUpdateSchema>) {
  await requireAdmin();
  const parsed = slotUpdateSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, error: "That value doesn't look right." };
  const { id, ...fields } = parsed.data;
  await db.timeSlot.update({ where: { id }, data: fields });
  return { success: true as const };
}

export async function toggleCouponAction(couponId: string, isActive: boolean) {
  await requireAdmin();
  await db.coupon.update({ where: { id: couponId }, data: { isActive } });
  return { success: true as const };
}

const createCouponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3)
    .max(20)
    .transform((s) => s.toUpperCase()),
  type: z.enum(["PERCENTAGE", "FLAT", "FREE_DELIVERY"]),
  value: z.number().int().min(0),
  minOrderValue: z.number().int().min(0).optional(),
  maxUses: z.number().int().min(1).optional(),
  firstOrderOnly: z.boolean().default(false),
});

export async function createCouponAction(input: z.infer<typeof createCouponSchema>) {
  await requireAdmin();
  const parsed = createCouponSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }
  const data = parsed.data;
  const existing = await db.coupon.findUnique({ where: { code: data.code } });
  if (existing) return { success: false as const, error: "A coupon with that code already exists." };
  await db.coupon.create({ data });
  return { success: true as const };
}

export async function updateEnquiryStatusAction(
  enquiryId: string,
  status: "NEW" | "RESPONDED" | "CLOSED"
) {
  await requireAdmin();
  await db.enquiry.update({ where: { id: enquiryId }, data: { status } });
  return { success: true as const };
}

export async function getReceivedCountAction() {
  await requireAdmin();
  return db.order.count({ where: { status: "RECEIVED" } });
}
