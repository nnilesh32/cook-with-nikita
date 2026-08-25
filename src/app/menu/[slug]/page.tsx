import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Section } from "@/components/layout/section";
import { ItemOptionsForm } from "@/components/menu/item-options-form";
import { MenuItemCard } from "@/components/menu/menu-item-card";
import { SpiceGlyphs } from "@/components/menu/spice-glyphs";
import { VegMark } from "@/components/menu/veg-mark";
import { buttonVariants } from "@/components/ui/button";
import { getProductDetail } from "@/lib/data/menu";
import { leadTimeLabel } from "@/lib/kitchen";
import { productJsonLd } from "@/lib/structured-data";
import { cn } from "@/lib/utils";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getProductDetail(slug);
  if (!detail) return {};
  return {
    title: detail.product.name,
    description: detail.product.description,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const detail = await getProductDetail(slug);
  if (!detail) notFound();

  const { product, reviews, related } = detail;

  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(detail)) }}
      />
      <Section className="pb-10">
        <p className="mb-6 font-mono text-xs text-ink/50">
          <Link href="/menu" className="hover:text-ink">
            Menu
          </Link>
          {" / "}
          <Link href={`/menu?category=${product.categorySlug}`} className="hover:text-ink">
            {product.categoryName}
          </Link>
          {" / "}
          <span className="text-ink/70">{product.name}</span>
        </p>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-steel/60 shadow-lg shadow-ink/5 lg:aspect-square">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              priority
              className="object-cover"
            />
            <VegMark vegType={product.vegType} className="absolute top-4 left-4 rounded-full bg-bone/90 px-2 py-1" />
          </div>

          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-medium tracking-tight text-ink sm:text-4xl">{product.name}</h1>
              <SpiceGlyphs level={product.spiceLevel} className="mt-2 shrink-0" />
            </div>
            <p className="mt-3 text-ink/65">{product.description}</p>
            <p className="mt-3 font-mono text-xs text-ink/45">
              Serves {product.servesCount} · {leadTimeLabel(product.leadTimeHours)}
            </p>

            <div className="mt-8 border-t border-steel/40 pt-8">
              {product.isSoldOutToday ? (
                <div className="rounded-xl border border-steel/50 bg-card p-5">
                  <p className="font-medium text-ink">Sold out for today.</p>
                  <p className="mt-1 text-sm text-ink/60">
                    This one goes fast — I make a limited batch each day. Try again tomorrow, or see
                    what else is cooking right now.
                  </p>
                  <Link href="/menu" className={cn(buttonVariants({ variant: "outline" }), "mt-4")}>
                    Browse the menu
                  </Link>
                </div>
              ) : (
                <ItemOptionsForm product={product} />
              )}
            </div>
          </div>
        </div>
      </Section>

      {reviews.length > 0 && (
        <Section className="border-t border-steel/40 bg-card/40">
          <p className="font-mono text-xs tracking-wide text-turmeric uppercase">What people say</p>
          <h2 className="mt-2 text-2xl font-medium tracking-tight text-ink">
            About the {product.name.toLowerCase()}
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <div key={review.id} className="flex flex-col gap-3 rounded-2xl border border-steel/50 bg-card p-5">
                <p className="font-mono text-xs text-turmeric" aria-label={`Rated ${review.rating} out of 5`}>
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </p>
                <p className="text-sm leading-relaxed text-ink/75">&ldquo;{review.quote}&rdquo;</p>
                <p className="mt-auto text-xs font-medium text-ink/50">{review.customerName}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {related.length > 0 && (
        <Section className="border-t border-steel/40">
          <p className="font-mono text-xs tracking-wide text-turmeric uppercase">
            More from {product.categoryName}
          </p>
          <h2 className="mt-2 text-2xl font-medium tracking-tight text-ink">You might also like</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <MenuItemCard key={item.id} product={item} />
            ))}
          </div>
        </Section>
      )}
    </main>
  );
}
