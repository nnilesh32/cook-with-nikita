import "server-only";

import type { Prisma, VegType } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { fuzzySearch } from "@/lib/fuzzy-search";
import { todayIso } from "@/lib/kitchen";

export type PriceBand = "under-200" | "200-400" | "400-plus";
export type SortOption = "popularity" | "price-asc" | "price-desc" | "newest";

export type MenuFilters = {
  category?: string;
  veg?: VegType;
  spice?: number;
  availableToday?: boolean;
  priceBand?: PriceBand;
  sort?: SortOption;
  q?: string;
};

export type MenuVariant = { id: string; label: string; priceDelta: number; isDefault: boolean };
export type MenuAddOn = { id: string; name: string; price: number };

export type MenuProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  categorySlug: string;
  categoryName: string;
  vegType: VegType;
  spiceLevel: number;
  servesCount: number;
  basePrice: number;
  variants: MenuVariant[];
  addOns: MenuAddOn[];
  dailyLimit: number | null;
  leadTimeHours: number;
  isTodaysSpecial: boolean;
  soldToday: number;
  isSoldOutToday: boolean;
};

const PRODUCT_CARD_INCLUDE = {
  category: true,
  variants: { orderBy: { sortOrder: "asc" as const } },
  addOns: true,
} satisfies Prisma.ProductInclude;

type ProductWithCard = Prisma.ProductGetPayload<{ include: typeof PRODUCT_CARD_INCLUDE }>;

function toMenuProduct(product: ProductWithCard, soldToday: number): MenuProduct {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    image: product.image,
    categorySlug: product.category.slug,
    categoryName: product.category.name,
    vegType: product.vegType,
    spiceLevel: product.spiceLevel,
    servesCount: product.servesCount,
    basePrice: product.basePrice,
    variants: product.variants.map((v) => ({
      id: v.id,
      label: v.label,
      priceDelta: v.priceDelta,
      isDefault: v.isDefault,
    })),
    addOns: product.addOns.map((a) => ({ id: a.id, name: a.name, price: a.price })),
    dailyLimit: product.dailyLimit,
    leadTimeHours: product.leadTimeHours,
    isTodaysSpecial: product.isTodaysSpecial,
    soldToday,
    isSoldOutToday: product.dailyLimit != null && soldToday >= product.dailyLimit,
  };
}

export async function getCategories() {
  return db.category.findMany({ orderBy: { sortOrder: "asc" } });
}

async function getSoldTodayMap() {
  const today = todayIso();
  const rows = await db.orderItem.groupBy({
    by: ["productId"],
    where: { order: { scheduledDate: today, status: { not: "CANCELLED" } } },
    _sum: { quantity: true },
  });
  return new Map(rows.map((row) => [row.productId, row._sum.quantity ?? 0]));
}

function priceBandMatch(price: number, band: PriceBand) {
  if (band === "under-200") return price < 200;
  if (band === "200-400") return price >= 200 && price <= 400;
  return price > 400;
}

/** Everything /menu needs: the full available catalogue, pre-filtered and
 * sorted. The catalogue is small (dozens of items), so search/sort/price
 * banding happen in memory rather than as increasingly baroque SQL. */
export async function getMenuProducts(filters: MenuFilters = {}): Promise<MenuProduct[]> {
  const [products, soldTodayMap] = await Promise.all([
    db.product.findMany({
      where: {
        isAvailable: true,
        ...(filters.category ? { category: { slug: filters.category } } : {}),
        ...(filters.veg ? { vegType: filters.veg } : {}),
      },
      include: PRODUCT_CARD_INCLUDE,
    }),
    getSoldTodayMap(),
  ]);

  let mapped = products.map((p) => ({
    ...toMenuProduct(p, soldTodayMap.get(p.id) ?? 0),
    popularity: p.popularity,
    createdAt: p.createdAt,
  }));

  if (filters.spice != null) {
    mapped = mapped.filter((p) => p.spiceLevel === filters.spice);
  }
  if (filters.availableToday) {
    mapped = mapped.filter((p) => p.leadTimeHours === 0 && !p.isSoldOutToday);
  }
  if (filters.priceBand) {
    mapped = mapped.filter((p) => priceBandMatch(p.basePrice, filters.priceBand!));
  }
  if (filters.q) {
    mapped = fuzzySearch(
      mapped,
      filters.q,
      (p) => `${p.name} ${p.categoryName}`,
      (p) => p.description
    );
  } else {
    switch (filters.sort) {
      case "price-asc":
        mapped.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case "price-desc":
        mapped.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case "newest":
        mapped.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case "popularity":
      default:
        mapped.sort((a, b) => b.popularity - a.popularity);
        break;
    }
  }

  return mapped;
}

/** Pantry items — shelf-stable, no lead-time cutoff or daily sell-out —
 * shown on /shop rather than the cooked-to-order /menu. Same Product
 * model, same cart, just a different pair of dabba wells. */
const SHOP_CATEGORY_SLUGS = ["pickles", "class-kits"];

export async function getShopProducts(filters: Omit<MenuFilters, "category"> = {}): Promise<MenuProduct[]> {
  const [products, soldTodayMap] = await Promise.all([
    db.product.findMany({
      where: {
        isAvailable: true,
        category: { slug: { in: SHOP_CATEGORY_SLUGS } },
        ...(filters.veg ? { vegType: filters.veg } : {}),
      },
      include: PRODUCT_CARD_INCLUDE,
    }),
    getSoldTodayMap(),
  ]);

  let mapped = products.map((p) => ({
    ...toMenuProduct(p, soldTodayMap.get(p.id) ?? 0),
    popularity: p.popularity,
    createdAt: p.createdAt,
  }));

  if (filters.priceBand) {
    mapped = mapped.filter((p) => priceBandMatch(p.basePrice, filters.priceBand!));
  }
  if (filters.q) {
    mapped = fuzzySearch(
      mapped,
      filters.q,
      (p) => `${p.name} ${p.categoryName}`,
      (p) => p.description
    );
  } else {
    switch (filters.sort) {
      case "price-asc":
        mapped.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case "price-desc":
        mapped.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case "newest":
        mapped.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case "popularity":
      default:
        mapped.sort((a, b) => b.popularity - a.popularity);
        break;
    }
  }

  return mapped;
}

export type ProductDetail = {
  product: MenuProduct;
  reviews: { id: string; rating: number; quote: string; customerName: string }[];
  related: MenuProduct[];
};

export async function getProductDetail(slug: string): Promise<ProductDetail | null> {
  const [product, soldTodayMap] = await Promise.all([
    db.product.findUnique({
      where: { slug },
      include: {
        ...PRODUCT_CARD_INCLUDE,
        reviews: { where: { isPublished: true }, orderBy: { createdAt: "desc" } },
      },
    }),
    getSoldTodayMap(),
  ]);

  if (!product) return null;

  const relatedRows = await db.product.findMany({
    where: { categoryId: product.categoryId, isAvailable: true, id: { not: product.id } },
    include: PRODUCT_CARD_INCLUDE,
    take: 4,
    orderBy: { popularity: "desc" },
  });

  return {
    product: toMenuProduct(product, soldTodayMap.get(product.id) ?? 0),
    reviews: product.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      quote: r.quote,
      customerName: r.customerName,
    })),
    related: relatedRows.map((r) => toMenuProduct(r, soldTodayMap.get(r.id) ?? 0)),
  };
}

/** The homepage "today's specials" strip. */
export async function getTodaysSpecials(limit = 5): Promise<MenuProduct[]> {
  const [products, soldTodayMap] = await Promise.all([
    db.product.findMany({
      where: { isTodaysSpecial: true, isAvailable: true },
      include: PRODUCT_CARD_INCLUDE,
      take: limit,
    }),
    getSoldTodayMap(),
  ]);
  return products.map((p) => toMenuProduct(p, soldTodayMap.get(p.id) ?? 0));
}

/** Looks up a specific, ordered set of products by slug — used by recipe
 * pages to cross-sell "shop the spice kit" without pulling in the full
 * catalogue query machinery. Missing/unavailable slugs are dropped
 * silently rather than erroring, since a recipe page shouldn't break
 * because one linked product went out of stock. */
export async function getProductsBySlugs(slugs: string[]): Promise<MenuProduct[]> {
  if (slugs.length === 0) return [];
  const [products, soldTodayMap] = await Promise.all([
    db.product.findMany({
      where: { slug: { in: slugs }, isAvailable: true },
      include: PRODUCT_CARD_INCLUDE,
    }),
    getSoldTodayMap(),
  ]);
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map((p) => toMenuProduct(p, soldTodayMap.get(p.id) ?? 0));
}

export async function getAllProductSlugs() {
  const products = await db.product.findMany({ select: { slug: true } });
  return products.map((p) => p.slug);
}
