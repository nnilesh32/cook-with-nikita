import type { Metadata } from "next";

import { Section } from "@/components/layout/section";
import { RecipeCard } from "@/components/recipes/recipe-card";
import { getAllRecipes } from "@/lib/data/recipes";

export const metadata: Metadata = {
  title: "Recipes",
  description: "How I actually make it, written down — with a servings scaler and a shortcut to shop the spice kit.",
};

export default async function RecipesPage() {
  const recipes = await getAllRecipes();

  return (
    <main id="main">
      <Section className="pb-0">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs tracking-wide text-turmeric uppercase">Recipes</p>
          <h1 className="mt-2 text-4xl font-medium tracking-tight text-ink sm:text-5xl">
            How I actually make it.
          </h1>
          <p className="mt-3 text-ink/65">
            Written the way I&apos;d explain it standing next to you — or skip the cooking and order the
            dish instead.
          </p>
        </div>
      </Section>

      <Section className="pt-10">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.slug} recipe={recipe} />
          ))}
        </div>
      </Section>
    </main>
  );
}
