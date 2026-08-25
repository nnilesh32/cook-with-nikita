import { CalendarPlus, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Section } from "@/components/layout/section";
import { Button, buttonVariants } from "@/components/ui/button";
import { googleCalendarLink } from "@/lib/calendar-link";
import { formatINR } from "@/lib/currency";
import { getOrderById } from "@/lib/data/orders";
import { whatsappLink } from "@/lib/site";
import { spiceLevelLabel } from "@/lib/spice";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Order placed" };

type Params = { id: string };

export default async function OrderConfirmationPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const isDelivery = order.fulfilment === "DELIVERY";
  const calendarHref = order.slot
    ? googleCalendarLink({
        title: `Cook with Nikita — order ${order.orderNumber}`,
        description: order.items.map((item) => `${item.quantity} × ${item.product.name}`).join(", "),
        location: isDelivery
          ? [order.address?.line1, order.address?.city].filter(Boolean).join(", ")
          : "Andheri West, Mumbai",
        date: order.scheduledDate,
        startTime: order.slot.startTime,
        endTime: order.slot.endTime,
      })
    : null;

  return (
    <main id="main">
      <Section className="max-w-2xl">
        <p className="font-mono text-xs tracking-wide text-coriander uppercase">Order placed</p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight text-ink sm:text-4xl">
          Thank you, {order.guestName.split(" ")[0]}.
        </h1>
        <p className="mt-3 text-ink/65">
          {isDelivery
            ? "I'll start cooking closer to your slot — no need to do anything else."
            : "Come by the kitchen at your slot and I'll have it ready."}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-steel/50 bg-card p-5">
          <div>
            <p className="text-xs text-ink/50">Order number</p>
            <p className="font-mono text-lg text-ink">{order.orderNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-ink/50">{isDelivery ? "Arriving" : "Ready for pickup"}</p>
            <p className="text-sm font-medium text-ink">
              {order.scheduledDate}
              {order.slot ? ` · ${order.slot.label}` : ""}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {calendarHref && (
            <a
              href={calendarHref}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
            >
              <CalendarPlus className="size-4" />
              Add to calendar
            </a>
          )}
          <a
            href={whatsappLink(`Hi Nikita! Checking in about order ${order.orderNumber}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
          >
            <MessageCircle className="size-4" />
            Message the kitchen
          </a>
        </div>

        <div className="mt-10 border-t border-steel/40 pt-6">
          <p className="text-sm font-medium text-ink">What you ordered</p>
          <ul className="mt-4 flex flex-col gap-4">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 text-sm">
                <div>
                  <p className="text-ink">
                    {item.quantity} × {item.product.name}
                    {item.variant ? ` (${item.variant.label})` : ""}
                  </p>
                  {(item.options.length > 0 || item.spiceLevel) && (
                    <p className="text-xs text-ink/50">
                      {[
                        spiceLevelLabel(item.spiceLevel) ? `${spiceLevelLabel(item.spiceLevel)} spice` : null,
                        ...item.options.map((o) => o.label),
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                  {item.specialInstructions && (
                    <p className="text-xs text-ink/40 italic">&ldquo;{item.specialInstructions}&rdquo;</p>
                  )}
                </div>
                <span className="shrink-0 font-mono text-ink">{formatINR(item.unitPrice * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-2 border-t border-steel/40 pt-4 font-mono text-sm">
            <BillRow label="Item total" value={formatINR(order.itemTotal)} />
            {order.packagingFee > 0 && <BillRow label="Packaging" value={formatINR(order.packagingFee)} />}
            <BillRow label="Delivery" value={order.deliveryFee === 0 ? "Free" : formatINR(order.deliveryFee)} />
            {order.discountAmount > 0 && (
              <BillRow label="Discount" value={`−${formatINR(order.discountAmount)}`} tone="coriander" />
            )}
            <BillRow label="GST" value={formatINR(order.gstAmount)} />
            <div className="mt-1 flex items-center justify-between border-t border-steel/40 pt-2 text-base">
              <span className="font-sans font-medium text-ink">Total paid</span>
              <span className="text-ink">{formatINR(order.grandTotal)}</span>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button render={<Link href="/menu" />}>Order again</Button>
          <Button variant="outline" render={<Link href="/" />}>
            Back home
          </Button>
        </div>
      </Section>
    </main>
  );
}

function BillRow({ label, value, tone }: { label: string; value: string; tone?: "coriander" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-sans text-ink/60">{label}</span>
      <span className={tone === "coriander" ? "text-coriander" : "text-ink"}>{value}</span>
    </div>
  );
}
