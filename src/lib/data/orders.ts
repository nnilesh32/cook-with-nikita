import "server-only";

import { db } from "@/lib/db";

export async function getOrderById(id: string) {
  return db.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true, variant: true, options: true } },
      address: true,
      slot: true,
      coupon: true,
    },
  });
}
