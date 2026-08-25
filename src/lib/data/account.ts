import "server-only";

import { db } from "@/lib/db";

/**
 * Everything /account needs for one signed-in customer. Orders/bookings
 * are matched by customerId — every checkout upserts a Customer row by
 * phone (see actions/checkout.ts), so this fills in retroactively even
 * for orders placed before the customer ever signed in.
 */
export async function getAccountOverview(customerId: string) {
  const [customer, orders, bookings] = await Promise.all([
    db.customer.findUnique({
      where: { id: customerId },
      include: { addresses: { orderBy: { isDefault: "desc" } } },
    }),
    db.order.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { product: true, variant: true, options: true } },
        slot: true,
        address: true,
      },
    }),
    db.booking.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      include: { classSession: true },
    }),
  ]);

  return { customer, orders, bookings };
}
