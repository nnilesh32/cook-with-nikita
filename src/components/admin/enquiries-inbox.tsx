"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateEnquiryStatusAction } from "@/app/actions/admin";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { getEnquiriesForAdmin } from "@/lib/data/admin";

type Enquiry = Awaited<ReturnType<typeof getEnquiriesForAdmin>>[number];
type Status = "NEW" | "RESPONDED" | "CLOSED";

export function EnquiriesInbox({ enquiries }: { enquiries: Enquiry[] }) {
  const groups: { key: string; label: string; items: Enquiry[] }[] = [
    { key: "all", label: `All (${enquiries.length})`, items: enquiries },
    { key: "new", label: `New (${enquiries.filter((e) => e.status === "NEW").length})`, items: enquiries.filter((e) => e.status === "NEW") },
    { key: "responded", label: "Responded", items: enquiries.filter((e) => e.status === "RESPONDED") },
    { key: "closed", label: "Closed", items: enquiries.filter((e) => e.status === "CLOSED") },
  ];

  return (
    <Tabs defaultValue="new">
      <TabsList>
        {groups.map((g) => (
          <TabsTrigger key={g.key} value={g.key}>
            {g.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {groups.map((g) => (
        <TabsContent key={g.key} value={g.key} className="mt-6">
          {g.items.length === 0 ? (
            <p className="rounded-xl border border-dashed border-steel/50 p-6 text-center text-sm text-ink/50">
              Nothing here.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {g.items.map((enquiry) => (
                <EnquiryCard key={enquiry.id} enquiry={enquiry} />
              ))}
            </ul>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}

function EnquiryCard({ enquiry }: { enquiry: Enquiry }) {
  const [status, setStatus] = useState<Status>(enquiry.status);
  const [pending, startTransition] = useTransition();

  return (
    <li className="rounded-xl border border-steel/50 bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink">
            {enquiry.name} · <span className="font-mono text-xs text-ink/50">{enquiry.type}</span>
          </p>
          <p className="mt-0.5 text-xs text-ink/50">
            {enquiry.phone}
            {enquiry.email ? ` · ${enquiry.email}` : ""} · {enquiry.createdAt.toLocaleDateString("en-IN")}
          </p>
        </div>
        <Select
          value={status}
          onValueChange={(value) => {
            if (!value) return;
            const next = value as Status;
            setStatus(next);
            startTransition(async () => {
              await updateEnquiryStatusAction(enquiry.id, next);
              toast.success("Status updated.");
            });
          }}
        >
          <SelectTrigger size="sm" className={pending ? "opacity-60" : undefined}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NEW">New</SelectItem>
            <SelectItem value="RESPONDED">Responded</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <p className="mt-3 text-sm text-ink/70">{enquiry.message}</p>
      {(enquiry.guestCount || enquiry.eventDate || enquiry.cuisine || enquiry.budgetBand) && (
        <p className="mt-2 font-mono text-xs text-ink/40">
          {[
            enquiry.guestCount ? `${enquiry.guestCount} guests` : null,
            enquiry.eventDate,
            enquiry.cuisine,
            enquiry.budgetBand,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}
    </li>
  );
}
