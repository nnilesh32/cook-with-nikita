"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { updateOrderStatusAction } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/currency";
import type { getActiveOrders } from "@/lib/data/admin";
import { nextStatus, ORDER_STATUS_LABEL } from "@/lib/order-status";
import { spiceLevelLabel } from "@/lib/spice";
import type { OrderStatus } from "@/generated/prisma/client";

type ActiveOrder = Awaited<ReturnType<typeof getActiveOrders>>[number];

type Column = { key: string; label: string; statuses: OrderStatus[] };

const COLUMNS: Column[] = [
  { key: "received", label: "Received", statuses: ["RECEIVED"] },
  { key: "accepted", label: "Accepted", statuses: ["ACCEPTED"] },
  { key: "cooking", label: "Cooking", statuses: ["COOKING"] },
  { key: "out", label: "Ready / out for delivery", statuses: ["READY", "OUT_FOR_DELIVERY"] },
];

export function OrdersBoard({ orders }: { orders: ActiveOrder[] }) {
  return (
    <div className="grid gap-5 lg:grid-cols-4">
      {COLUMNS.map((column) => {
        const columnOrders = orders.filter((o) => column.statuses.includes(o.status));
        return (
          <div key={column.key} className="flex flex-col gap-3">
            <p className="flex items-center justify-between text-sm font-medium text-ink">
              {column.label}
              <span className="font-mono text-xs text-ink/40">{columnOrders.length}</span>
            </p>
            <div className="flex flex-col gap-3">
              {columnOrders.length === 0 ? (
                <div className="rounded-xl border border-dashed border-steel/50 p-4 text-center text-xs text-ink/40">
                  Nothing here
                </div>
              ) : (
                columnOrders.map((order) => <OrderCard key={order.id} order={order} />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OrderCard({ order }: { order: ActiveOrder }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const advanceTo = nextStatus(order.status, order.fulfilment);

  function handleAdvance() {
    if (!advanceTo) return;
    startTransition(async () => {
      await updateOrderStatusAction(order.id, advanceTo);
      toast.success(`${order.orderNumber} moved to ${ORDER_STATUS_LABEL[advanceTo]}.`);
      router.refresh();
    });
  }

  function handleCancel() {
    startTransition(async () => {
      await updateOrderStatusAction(order.id, "CANCELLED");
      toast.success(`${order.orderNumber} cancelled.`);
      router.refresh();
    });
  }

  return (
    <div className="rounded-xl border border-steel/50 bg-card p-3.5 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-ink">{order.orderNumber}</span>
        <span className="font-mono text-xs text-ink/50">{formatINR(order.grandTotal)}</span>
      </div>
      <p className="mt-1 text-xs text-ink/50">
        {order.guestName} · {order.fulfilment === "DELIVERY" ? "Delivery" : "Pickup"}
        {order.slot ? ` · ${order.slot.label}` : ""}
      </p>
      <p className="mt-2 line-clamp-2 text-xs text-ink/65">
        {order.items
          .map((item) => {
            const spice = spiceLevelLabel(item.spiceLevel);
            return `${item.quantity}× ${item.product.name}${spice ? ` (${spice})` : ""}`;
          })
          .join(", ")}
      </p>
      <div className="mt-3 flex gap-2">
        {advanceTo && (
          <Button size="xs" onClick={handleAdvance} disabled={pending}>
            Move to {ORDER_STATUS_LABEL[advanceTo]}
          </Button>
        )}
        {order.status !== "COMPLETED" && (
          <Button size="xs" variant="ghost" onClick={handleCancel} disabled={pending}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
