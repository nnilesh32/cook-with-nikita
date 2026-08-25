"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";

import type { RecipeFrontmatter } from "@/lib/data/recipes";

function formatQuantity(quantity: number) {
  const rounded = Math.round(quantity * 100) / 100;
  return rounded.toString();
}

export function ServingsScaler({
  baseServings,
  ingredients,
}: {
  baseServings: number;
  ingredients: RecipeFrontmatter["ingredients"];
}) {
  const [servings, setServings] = useState(baseServings);
  const multiplier = servings / baseServings;

  return (
    <div className="rounded-2xl border border-steel/50 bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink">Ingredients</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Fewer servings"
            onClick={() => setServings((s) => Math.max(1, s - 1))}
            className="flex size-7 items-center justify-center rounded-full border border-steel/60 text-ink hover:bg-muted"
          >
            <Minus className="size-3.5" />
          </button>
          <span className="font-mono text-xs text-ink/70">{servings} serving{servings > 1 ? "s" : ""}</span>
          <button
            type="button"
            aria-label="More servings"
            onClick={() => setServings((s) => Math.min(24, s + 1))}
            className="flex size-7 items-center justify-center rounded-full border border-steel/60 text-ink hover:bg-muted"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      </div>

      <ul className="mt-4 flex flex-col gap-2.5">
        {ingredients.map((ingredient, i) => (
          <li key={i} className="flex items-baseline justify-between gap-4 text-sm">
            <span className="text-ink/80">{ingredient.name}</span>
            <span className="shrink-0 font-mono text-xs text-ink/50">
              {ingredient.quantity == null ? ingredient.unit : `${formatQuantity(ingredient.quantity * multiplier)} ${ingredient.unit}`.trim()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
