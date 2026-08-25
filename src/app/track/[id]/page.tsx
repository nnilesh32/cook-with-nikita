import { MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Section } from "@/components/layout/section";
import { CancelOrderButton } from "@/components/account/order-actions";
import { AutoRefresh } from "@/components/track/auto-refresh";
import { StatusTimeline } from "@/components/track/status-timeline";
import { buttonVariants } from "@/components/ui/button";
import { formatINR } from "@/lib/currency";
import { getOrderById } from "@/lib/data/orders";
import { isCancellable } from "@/lib/order-status";
import { whatsappLink } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Track your order" };
export const dynamic = "force-dynamic";

type Params = { id: string };

export default async function TrackOrderPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const isDelivery = order.fulfilment === "DELIVERY";

  return (
    <main id="main">
      <AutoRefresh />
      <Section className="max-w-2xl">
        <p className="font-mono text-xs tracking-wide text-coriander uppercase">Tracking</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-medium tracking-tight text-ink sm:text-4xl">{order.orderNumber}</h1>
          <p className="text-sm text-ink/60">
            {order.scheduledDate}
            {order.slot ? ` · ${order.slot.label}` : ""}
          </p>
        </div>
        <p className="mt-2 text-sm text-ink/60">
          {isDelivery ? "Delivering to" : "Pickup from"}{" "}
          {isDelivery
            ? [order.address?.line1, order.address?.city].filter(Boolean).join(", ")
            : "Andheri West, Mumbai"}
        </p>

        <div className="mt-8 rounded-2xl border border-steel/50 bg-card p-6">
          <StatusTimeline status={order.status} fulfilment={order.fulfilment} />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={whatsappLink(`Hi Nikita! Checking in about order ${order.orderNumber}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
          >
            <MessageCircle className="size-4" />
            Message the kitchen
          </a>
          {isCancellable(order.status) && <CancelOrderButton orderId={order.id} />}
        </div>

        <div className="mt-10 border-t border-steel/40 pt-6">
          <p className="text-sm font-medium text-ink">What you ordered</p>
          <ul className="mt-4 flex flex-col gap-3">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 text-sm">
                <p className="text-ink">
                  {item.quantity} × {item.product.name}
                  {item.variant ? ` (${item.variant.label})` : ""}
                </p>
                <span className="shrink-0 font-mono text-ink">{formatINR(item.unitPrice * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-steel/40 pt-4 text-base">
            <span className="font-medium text-ink">Total paid</span>
            <span className="font-mono text-ink">{formatINR(order.grandTotal)}</span>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-ink/40">This page updates on its own every 20 seconds.</p>
      </Section>
    </main>
  );
}
