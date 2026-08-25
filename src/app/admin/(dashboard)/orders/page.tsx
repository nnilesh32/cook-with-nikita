import type { Metadata } from "next";

import { OrdersBoard } from "@/components/admin/orders-board";
import { getActiveOrders } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Orders — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await getActiveOrders();

  return (
    <div>
      <h1 className="text-2xl font-medium tracking-tight text-ink">Orders</h1>
      <p className="mt-1 text-sm text-ink/60">
        {orders.length} active order{orders.length === 1 ? "" : "s"} — move a card as it progresses through
        the kitchen.
      </p>
      <div className="mt-8">
        <OrdersBoard orders={orders} />
      </div>
    </div>
  );
}
