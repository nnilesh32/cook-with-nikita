import type { Metadata } from "next";

import { RevenueChart } from "@/components/admin/revenue-chart";
import { formatINR } from "@/lib/currency";
import { getRevenueByDay, getReportSummary, getTopItems } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Reports — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const [revenue, topItems, summary] = await Promise.all([
    getRevenueByDay(14),
    getTopItems(8),
    getReportSummary(),
  ]);

  const cards = [
    { label: "Total orders", value: summary.totalOrders.toLocaleString("en-IN") },
    { label: "Total revenue", value: formatINR(summary.totalRevenue) },
    { label: "Active coupons", value: summary.activeCoupons.toString() },
    { label: "New enquiries", value: summary.newEnquiries.toString() },
  ];

  return (
    <div>
      <h1 className="text-2xl font-medium tracking-tight text-ink">Reports</h1>
      <p className="mt-1 text-sm text-ink/60">Revenue over the last 14 days, and what&apos;s selling.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-steel/50 bg-card p-4">
            <p className="text-xs text-ink/50">{card.label}</p>
            <p className="mt-1 text-xl font-medium text-ink">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-steel/50 bg-card p-6">
        <p className="text-sm font-medium text-ink">Revenue by day</p>
        <div className="mt-6">
          <RevenueChart data={revenue} />
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-steel/50 bg-card p-6">
        <p className="text-sm font-medium text-ink">Top items</p>
        <ul className="mt-4 flex flex-col gap-2.5">
          {topItems.length === 0 ? (
            <p className="text-sm text-ink/50">No orders yet.</p>
          ) : (
            topItems.map((item, i) => (
              <li key={item.productId} className="flex items-center justify-between text-sm">
                <span className="text-ink/80">
                  <span className="mr-2 font-mono text-xs text-ink/40">{i + 1}.</span>
                  {item.name}
                </span>
                <span className="font-mono text-xs text-ink/50">{item.quantity} sold</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
