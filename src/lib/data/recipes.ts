import "server-only";

import fs from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import { z } from "zod";

import { images } from "@/lib/images";

const RECIPES_DIR = path.join(process.cwd(), "content", "recipes");

const ingredientSchema = z.object({
  name: z.string(),
  quantity: z.number().nullable(),
  unit: z.string(),
});

const frontmatterSchema = z.object({
  title: z.string(),
  description: z.string(),
  /** Key into lib/images.ts's `categories` map — recipes reuse the same
   * curated category photography rather than sourcing new stock per
   * recipe. */
  image: z.enum(["curries", "biryani", "snacks", "breads", "sweets", "pickles", "classKits"]),
  servings: z.number().int().min(1),
  prepMinutes: z.number().int().min(0),
  cookMinutes: z.number().int().min(0),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  tags: z.array(z.string()),
  /** Product slugs to cross-sell — "shop the spice kit" etc. */
  relatedProductSlugs: z.array(z.string()).default([]),
  publishedAt: z.string(),
  ingredients: z.array(ingredientSchema),
});

export type RecipeFrontmatter = z.infer<typeof frontmatterSchema>;
export type RecipeSummary = RecipeFrontmatter & { slug: string };

async function recipeFiles() {
  const files = await fs.readdir(RECIPES_DIR);
  return files.filter((f) => f.endsWith(".mdx"));
}

function slugFromFilename(filename: string) {
  return filename.replace(/\.mdx$/, "");
}

export function recipeImage(key: RecipeFrontmatter["image"]) {
  return images.categories[key];
}

/** Frontmatter only, for the /recipes listing — doesn't compile MDX
 * bodies it isn't going to render. */
export async function getAllRecipes(): Promise<RecipeSummary[]> {
  const files = await recipeFiles();
  const recipes = await Promise.all(
    files.map(async (file) => {
      const raw = await fs.readFile(path.join(RECIPES_DIR, file), "utf8");
      const { data } = matter(raw);
      const frontmatter = frontmatterSchema.parse(data);
      return { ...frontmatter, slug: slugFromFilename(file) };
    })
  );
  return recipes.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getAllRecipeSlugs() {
  const files = await recipeFiles();
  return files.map(slugFromFilename);
}

export async function getRecipeBySlug(slug: string) {
  const filePath = path.join(RECIPES_DIR, `${slug}.mdx`);
  let raw: string;
  try {
    raw = await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }

  const { content, frontmatter } = await compileMDX<RecipeFrontmatter>({
    source: raw,
    options: { parseFrontmatter: true },
  });

  return {
    slug,
    frontmatter: frontmatterSchema.parse(frontmatter),
    content,
  };
}
