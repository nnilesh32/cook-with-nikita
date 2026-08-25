import type { Metadata } from "next";
import { Suspense } from "react";

import { Section } from "@/components/layout/section";
import { FilterBar } from "@/components/menu/filter-bar";
import { MenuItemCard } from "@/components/menu/menu-item-card";
import type { VegType } from "@/generated/prisma/client";
import { getShopProducts, type PriceBand, type SortOption } from "@/lib/data/menu";

export const metadata: Metadata = {
  title: "Shop",
  description: "Pickles and class kits that keep on the shelf — mine, jarred and boxed, delivered or ready for pickup.",
};
export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const veg = firstValue(params.veg) as VegType | undefined;
  const priceBand = firstValue(params.price) as PriceBand | undefined;
  const sort = (firstValue(params.sort) as SortOption | undefined) || "popularity";
  const q = firstValue(params.q);

  const products = await getShopProducts({
    veg: veg || undefined,
    priceBand: priceBand || undefined,
    sort,
    q: q || undefined,
  });

  return (
    <main id="main">
      <Section className="pb-0">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs tracking-wide text-turmeric uppercase">The shop</p>
          <h1 className="mt-2 text-4xl font-medium tracking-tight text-ink sm:text-5xl">
            Pickles and kits, for whenever.
          </h1>
          <p className="mt-3 text-ink/65">
            Nothing here sells out by evening — jar it, box it, ship it. Same cart as the rest of the
            menu, so add away.
          </p>
        </div>
      </Section>

      <Section className="pt-10">
        <Suspense fallback={<div className="h-24" />}>
          <FilterBar />
        </Suspense>

        <div className="mt-8">
          {products.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-steel/60 py-20 text-center">
              <p className="text-lg font-medium text-ink">Nothing matches that.</p>
              <p className="max-w-sm text-sm text-ink/55">Try clearing a filter or searching a different word.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <MenuItemCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </Section>
    </main>
  );
}
