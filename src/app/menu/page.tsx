import type { Metadata } from "next";
import { Suspense } from "react";

import { Section } from "@/components/layout/section";
import { DabbaSelector } from "@/components/menu/dabba-selector";
import { FilterBar } from "@/components/menu/filter-bar";
import { MenuItemCard } from "@/components/menu/menu-item-card";
import type { VegType } from "@/generated/prisma/client";
import { getCategories, getMenuProducts, type PriceBand, type SortOption } from "@/lib/data/menu";
import { menuJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Order home-style curries, biryani, snacks, breads, sweets, pickles and class kits — cooked fresh, ready for delivery or pickup.",
};

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const category = firstValue(params.category);
  const veg = firstValue(params.veg) as VegType | undefined;
  const spiceRaw = firstValue(params.spice);
  const priceBand = firstValue(params.price) as PriceBand | undefined;
  const sort = (firstValue(params.sort) as SortOption | undefined) || "popularity";
  const q = firstValue(params.q);
  const availableToday = firstValue(params.available) === "today";

  const [categories, products] = await Promise.all([
    getCategories(),
    getMenuProducts({
      category,
      veg: veg || undefined,
      spice: spiceRaw ? Number(spiceRaw) : undefined,
      priceBand: priceBand || undefined,
      sort,
      q: q || undefined,
      availableToday,
    }),
  ]);

  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(menuJsonLd(products)) }}
      />
      <Section className="pb-0">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs tracking-wide text-turmeric uppercase">The menu</p>
          <h1 className="mt-2 text-4xl font-medium tracking-tight text-ink sm:text-5xl">
            Pick a well, or see it all.
          </h1>
          <p className="mt-3 text-ink/65">
            Everything below is cooked to order — some dishes need a day&apos;s notice, and a few sell
            out by evening.
          </p>
        </div>

        <div className="mt-12">
          <DabbaSelector categories={categories} activeSlug={category} />
        </div>
      </Section>

      <Section className="pt-10">
        <Suspense fallback={<div className="h-24" />}>
          <FilterBar />
        </Suspense>

        <div className="mt-8">
          {products.length === 0 ? (
            <EmptyState hasQuery={Boolean(q)} />
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

function EmptyState({ hasQuery }: { hasQuery: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-steel/60 py-20 text-center">
      <p className="text-lg font-medium text-ink">
        {hasQuery ? "Nothing matches that search." : "Nothing here for this combination."}
      </p>
      <p className="max-w-sm text-sm text-ink/55">
        {hasQuery
          ? "Try a shorter word, or clear the search and browse by category instead."
          : "Try a different well on the dabba, or clear a filter — the kitchen's fuller than this."}
      </p>
    </div>
  );
}
