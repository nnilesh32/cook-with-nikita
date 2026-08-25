import "server-only";

import { db } from "@/lib/db";
import { todayIso } from "@/lib/kitchen";

/** Active orders for the kanban board — everything except terminal
 * states, newest-scheduled-first isn't as useful here as oldest-received
 * first, since that's the queue order the kitchen actually works in. */
export async function getActiveOrders() {
  return db.order.findMany({
    where: { status: { notIn: ["COMPLETED", "CANCELLED"] } },
    orderBy: { createdAt: "asc" },
    include: {
      items: { include: { product: true, variant: true } },
      slot: true,
    },
  });
}

export async function getReceivedOrderCount() {
  return db.order.count({ where: { status: "RECEIVED" } });
}

export async function getAllProductsForAdmin() {
  return db.product.findMany({
    orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
    include: { category: true },
  });
}

export async function getTimeSlotsForAdmin() {
  return db.timeSlot.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getUpcomingClassesForAdmin() {
  const sessions = await db.classSession.findMany({
    where: { dateTime: { gte: new Date() } },
    orderBy: { dateTime: "asc" },
    include: { bookings: { where: { status: { not: "CANCELLED" } } } },
  });
  return sessions.map((s) => ({
    ...s,
    seatsBooked: s.bookings.reduce((sum, b) => sum + b.seats, 0),
  }));
}

export async function getCouponsForAdmin() {
  return db.coupon.findMany({ orderBy: { code: "asc" } });
}

export async function getEnquiriesForAdmin(status?: "NEW" | "RESPONDED" | "CLOSED") {
  return db.enquiry.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
  });
}

/** Revenue and order count for the last N days, including days with zero
 * orders so the report reads as a continuous timeline. */
export async function getRevenueByDay(days = 14) {
  const today = new Date();
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(todayIso(d));
  }

  const orders = await db.order.findMany({
    where: { scheduledDate: { in: dates }, status: { not: "CANCELLED" } },
    select: { scheduledDate: true, grandTotal: true },
  });

  const byDate = new Map<string, { revenue: number; orders: number }>();
  for (const date of dates) byDate.set(date, { revenue: 0, orders: 0 });
  for (const order of orders) {
    const bucket = byDate.get(order.scheduledDate);
    if (bucket) {
      bucket.revenue += order.grandTotal;
      bucket.orders += 1;
    }
  }

  return dates.map((date) => ({ date, ...byDate.get(date)! }));
}

export async function getTopItems(limit = 8) {
  const rows = await db.orderItem.groupBy({
    by: ["productId"],
    where: { order: { status: { not: "CANCELLED" } } },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  });
  const products = await db.product.findMany({
    where: { id: { in: rows.map((r) => r.productId) } },
    select: { id: true, name: true },
  });
  const nameById = new Map(products.map((p) => [p.id, p.name]));
  return rows.map((r) => ({
    productId: r.productId,
    name: nameById.get(r.productId) ?? "Unknown item",
    quantity: r._sum.quantity ?? 0,
  }));
}

export async function getReportSummary() {
  const [totalOrders, totalRevenue, activeCoupons, newEnquiries] = await Promise.all([
    db.order.count({ where: { status: { not: "CANCELLED" } } }),
    db.order.aggregate({ where: { status: { not: "CANCELLED" } }, _sum: { grandTotal: true } }),
    db.coupon.count({ where: { isActive: true } }),
    db.enquiry.count({ where: { status: "NEW" } }),
  ]);
  return {
    totalOrders,
    totalRevenue: totalRevenue._sum.grandTotal ?? 0,
    activeCoupons,
    newEnquiries,
  };
}
