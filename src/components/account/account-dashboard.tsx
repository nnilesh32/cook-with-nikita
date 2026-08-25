import Link from "next/link";

import { CancelOrderButton, ReorderButton, SignOutButton } from "@/components/account/order-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatINR } from "@/lib/currency";
import type { getAccountOverview } from "@/lib/data/account";
import { isCancellable, ORDER_STATUS_BADGE_CLASS, ORDER_STATUS_LABEL } from "@/lib/order-status";

type Overview = Awaited<ReturnType<typeof getAccountOverview>>;

export function AccountDashboard({ overview }: { overview: Overview }) {
  const { customer, orders, bookings } = overview;
  if (!customer) return null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-steel/40 pb-6">
        <div>
          <p className="font-mono text-xs tracking-wide text-turmeric uppercase">Account</p>
          <h1 className="mt-1 text-3xl font-medium tracking-tight text-ink">
            {customer.name && customer.name !== customer.phone ? customer.name : "Hi there"}
          </h1>
          <p className="mt-1 text-sm text-ink/60">{customer.phone}</p>
        </div>
        <SignOutButton />
      </div>

      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
          <TabsTrigger value="classes">Classes ({bookings.length})</TabsTrigger>
          <TabsTrigger value="addresses">Addresses ({customer.addresses.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-6">
          {orders.length === 0 ? (
            <EmptyState message="No orders yet." ctaHref="/menu" ctaLabel="Browse the menu" />
          ) : (
            <ul className="flex flex-col gap-4">
              {orders.map((order) => (
                <li key={order.id} className="rounded-2xl border border-steel/50 bg-card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Link href={`/track/${order.id}`} className="font-mono text-sm text-ink hover:underline">
                          {order.orderNumber}
                        </Link>
                        <Badge className={ORDER_STATUS_BADGE_CLASS[order.status]}>
                          {ORDER_STATUS_LABEL[order.status]}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-ink/50">
                        {order.scheduledDate}
                        {order.slot ? ` · ${order.slot.label}` : ""} ·{" "}
                        {order.fulfilment === "DELIVERY" ? "Delivery" : "Pickup"}
                      </p>
                    </div>
                    <p className="font-mono text-sm text-ink">{formatINR(order.grandTotal)}</p>
                  </div>

                  <p className="mt-3 text-sm text-ink/70">
                    {order.items.map((item) => `${item.quantity} × ${item.product.name}`).join(", ")}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" render={<Link href={`/track/${order.id}`} />}>
                      Track order
                    </Button>
                    <ReorderButton orderId={order.id} />
                    {isCancellable(order.status) && <CancelOrderButton orderId={order.id} />}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="classes" className="mt-6">
          {bookings.length === 0 ? (
            <EmptyState message="No classes booked yet." ctaHref="/classes" ctaLabel="See upcoming classes" />
          ) : (
            <ul className="flex flex-col gap-4">
              {bookings.map((booking) => (
                <li
                  key={booking.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-steel/50 bg-card p-5"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">{booking.classSession.title}</p>
                    <p className="mt-1 text-xs text-ink/50">
                      {new Date(booking.classSession.dateTime).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}{" "}
                      · {booking.seats} seat{booking.seats > 1 ? "s" : ""}
                    </p>
                  </div>
                  <Badge className={booking.status === "CANCELLED" ? "bg-kashmiri/15 text-kashmiri" : "bg-coriander/20 text-coriander"}>
                    {booking.status === "CANCELLED" ? "Cancelled" : "Confirmed"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="addresses" className="mt-6">
          {customer.addresses.length === 0 ? (
            <EmptyState message="No saved addresses yet — one gets saved the next time you order for delivery." />
          ) : (
            <ul className="flex flex-col gap-3">
              {customer.addresses.map((address) => (
                <li key={address.id} className="rounded-xl border border-steel/50 bg-card p-4 text-sm">
                  <p className="font-medium text-ink">{address.label}</p>
                  <p className="mt-1 text-ink/60">
                    {[address.line1, address.line2, address.city, address.pincode].filter(Boolean).join(", ")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ message, ctaHref, ctaLabel }: { message: string; ctaHref?: string; ctaLabel?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-steel/50 p-8 text-center">
      <p className="text-sm text-ink/60">{message}</p>
      {ctaHref && ctaLabel && (
        <Button size="sm" className="mt-4" render={<Link href={ctaHref} />}>
          {ctaLabel}
        </Button>
      )}
    </div>
  );
}
