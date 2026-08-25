import type { Metadata } from "next";

import { EnquiriesInbox } from "@/components/admin/enquiries-inbox";
import { getEnquiriesForAdmin } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Enquiries — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminEnquiriesPage() {
  const enquiries = await getEnquiriesForAdmin();

  return (
    <div>
      <h1 className="text-2xl font-medium tracking-tight text-ink">Enquiries</h1>
      <p className="mt-1 text-sm text-ink/60">Catering and contact-form messages, newest first.</p>
      <div className="mt-8">
        <EnquiriesInbox enquiries={enquiries} />
      </div>
    </div>
  );
}
