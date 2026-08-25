import Image from "next/image";
import Link from "next/link";

import { recipeImage, type RecipeSummary } from "@/lib/data/recipes";

export function RecipeCard({ recipe }: { recipe: RecipeSummary }) {
  const image = recipeImage(recipe.image);
  return (
    <Link
      href={`/recipes/${recipe.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-steel/50 bg-card"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 90vw"
          className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="font-mono text-[0.65rem] tracking-wide text-turmeric uppercase">
          {recipe.tags[0] ?? "Recipe"}
        </p>
        <p className="text-sm font-medium text-ink">{recipe.title}</p>
        <p className="line-clamp-2 text-xs text-ink/55">{recipe.description}</p>
        <p className="mt-auto pt-3 font-mono text-[0.65rem] text-ink/40">
          Serves {recipe.servings} · {recipe.prepMinutes + recipe.cookMinutes} min · {recipe.difficulty}
        </p>
      </div>
    </Link>
  );
}
