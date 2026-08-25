import type { Metadata } from "next";

import { CouponsManager } from "@/components/admin/coupons-manager";
import { getCouponsForAdmin } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Coupons — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const coupons = await getCouponsForAdmin();

  return (
    <div>
      <h1 className="text-2xl font-medium tracking-tight text-ink">Coupons</h1>
      <p className="mt-1 text-sm text-ink/60">Toggle a code off without deleting it, or add a new one.</p>
      <div className="mt-8 rounded-2xl border border-steel/50 bg-card p-4">
        <CouponsManager coupons={coupons} />
      </div>
    </div>
  );
}
