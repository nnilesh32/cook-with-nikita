import type { Metadata } from "next";

import { MenuManager } from "@/components/admin/menu-manager";
import { getAllProductsForAdmin } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Menu — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  const products = await getAllProductsForAdmin();

  return (
    <div>
      <h1 className="text-2xl font-medium tracking-tight text-ink">Menu</h1>
      <p className="mt-1 text-sm text-ink/60">
        Price, daily limit, today&apos;s special and availability — changes save as soon as you leave the
        field.
      </p>
      <div className="mt-8 rounded-2xl border border-steel/50 bg-card p-2">
        <MenuManager products={products} />
      </div>
    </div>
  );
}
