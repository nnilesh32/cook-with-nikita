import { Clock, Users } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Section } from "@/components/layout/section";
import { MenuItemCard } from "@/components/menu/menu-item-card";
import { RecipeContent } from "@/components/recipes/recipe-content";
import { ServingsScaler } from "@/components/recipes/servings-scaler";
import { getProductsBySlugs } from "@/lib/data/menu";
import { getRecipeBySlug, recipeImage } from "@/lib/data/recipes";
import { recipeJsonLd } from "@/lib/structured-data";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);
  if (!recipe) return {};
  return { title: recipe.frontmatter.title, description: recipe.frontmatter.description };
}

export default async function RecipeDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);
  if (!recipe) notFound();

  const { frontmatter, content } = recipe;
  const image = recipeImage(frontmatter.image);
  const relatedProducts = await getProductsBySlugs(frontmatter.relatedProductSlugs);

  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeJsonLd(frontmatter, slug, image)) }}
      />
      <Section className="max-w-3xl">
        <p className="font-mono text-xs tracking-wide text-turmeric uppercase">{frontmatter.tags[0] ?? "Recipe"}</p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight text-ink sm:text-4xl">{frontmatter.title}</h1>
        <p className="mt-3 text-ink/65">{frontmatter.description}</p>

        <div className="mt-6 flex flex-wrap gap-6 text-sm text-ink/70">
          <span className="flex items-center gap-1.5">
            <Users className="size-4 text-ink/40" />
            Serves {frontmatter.servings}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-4 text-ink/40" />
            {frontmatter.prepMinutes} min prep · {frontmatter.cookMinutes} min cook
          </span>
          <span className="font-mono text-xs text-ink/50 uppercase">{frontmatter.difficulty}</span>
        </div>

        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl">
          <Image src={image.src} alt={image.alt} fill priority className="object-cover" />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ServingsScaler baseServings={frontmatter.servings} ingredients={frontmatter.ingredients} />
          </div>
          <RecipeContent>{content}</RecipeContent>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-14 border-t border-steel/40 pt-8">
            <p className="text-sm font-medium text-ink">Skip the cooking — shop it instead</p>
            <p className="mt-1 text-sm text-ink/60">
              I make this fresh, or send the spice kit if you&apos;d rather cook it yourself.
            </p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {relatedProducts.map((product) => (
                <MenuItemCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </Section>
    </main>
  );
}
