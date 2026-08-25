import type { Metadata } from "next";

import { SlotsManager } from "@/components/admin/slots-manager";
import { getTimeSlotsForAdmin, getUpcomingClassesForAdmin } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Classes & slots — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminClassesPage() {
  const [slots, classes] = await Promise.all([getTimeSlotsForAdmin(), getUpcomingClassesForAdmin()]);

  return (
    <div className="flex flex-col gap-12">
      <div>
        <h1 className="text-2xl font-medium tracking-tight text-ink">Order time slots</h1>
        <p className="mt-1 text-sm text-ink/60">
          Capacity per slot for delivery and pickup orders — turn a slot off entirely if the kitchen needs
          a break.
        </p>
        <div className="mt-6 rounded-2xl border border-steel/50 bg-card p-2">
          <SlotsManager slots={slots} />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-medium tracking-tight text-ink">Upcoming classes</h2>
        <p className="mt-1 text-sm text-ink/60">Seats booked against capacity for each scheduled class.</p>
        <div className="mt-6 flex flex-col gap-3">
          {classes.length === 0 ? (
            <p className="text-sm text-ink/50">No classes scheduled.</p>
          ) : (
            classes.map((c) => (
              <div
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-steel/50 bg-card p-4"
              >
                <div>
                  <p className="text-sm font-medium text-ink">{c.title}</p>
                  <p className="mt-0.5 text-xs text-ink/50">
                    {c.dateTime.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} ·{" "}
                    {c.mode === "ONLINE" ? "Online" : "In person"}
                  </p>
                </div>
                <p className="font-mono text-sm text-ink">
                  {c.seatsBooked} / {c.seatsTotal} seats
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
