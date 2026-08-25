import type { MetadataRoute } from "next";

import { getAllClassSlugs } from "@/lib/data/classes";
import { getAllProductSlugs } from "@/lib/data/menu";
import { getAllRecipeSlugs } from "@/lib/data/recipes";
import { SITE_URL } from "@/lib/site";

const STATIC_ROUTES = [
  "",
  "/menu",
  "/classes",
  "/catering",
  "/shop",
  "/recipes",
  "/about",
  "/gallery",
  "/faq",
  "/contact",
  "/privacy",
  "/terms",
  "/refund-policy",
  "/shipping-and-delivery",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productSlugs, classSlugs, recipeSlugs] = await Promise.all([
    getAllProductSlugs(),
    getAllClassSlugs(),
    getAllRecipeSlugs(),
  ]);

  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const productEntries: MetadataRoute.Sitemap = productSlugs.map((slug) => ({
    url: `${SITE_URL}/menu/${slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  const classEntries: MetadataRoute.Sitemap = classSlugs.map((slug) => ({
    url: `${SITE_URL}/classes/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const recipeEntries: MetadataRoute.Sitemap = recipeSlugs.map((slug) => ({
    url: `${SITE_URL}/recipes/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticEntries, ...productEntries, ...classEntries, ...recipeEntries];
}
