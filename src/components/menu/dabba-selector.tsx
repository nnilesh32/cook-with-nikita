"use client";

import Link from "next/link";

import { getDabbaIcon } from "@/lib/dabba-icons";
import { cn } from "@/lib/utils";

type DabbaCategory = { id: string; slug: string; name: string; icon: string };

/**
 * The masala dabba category selector — the one bold thing on the site.
 * A steel tin with a well per category; picking a well lifts it and
 * rotates the lid so its pointer settles on the selection.
 *
 * The rotation is a plain CSS transition on an inline `transform`, not a
 * Framer Motion spring: each category click is a real navigation (a new
 * server render arrives, not a client-state update), and a JS-driven
 * animation loop reliably gets cut short by that page-level re-render.
 * A CSS transition hands the animation to the compositor instead, so it
 * finishes regardless of what React does around it.
 */
export function DabbaSelector({
  categories,
  activeSlug,
}: {
  categories: DabbaCategory[];
  activeSlug?: string;
}) {
  const count = categories.length;
  const activeIndex = categories.findIndex((c) => c.slug === activeSlug);
  const anglePerWell = 360 / count;
  const lidRotation = activeIndex >= 0 ? activeIndex * anglePerWell : 0;
  const activeCategory = activeIndex >= 0 ? categories[activeIndex] : null;

  return (
    <div className="mx-auto flex flex-col items-center gap-5">
      <div className="relative aspect-square w-[280px] sm:w-[360px] lg:w-[400px]">
        <div
          className="absolute inset-[7%] rounded-full"
          style={{
            background:
              "radial-gradient(circle at 34% 28%, color-mix(in oklch, var(--steel) 60%, white 40%), color-mix(in oklch, var(--steel) 82%, black 8%) 72%)",
            boxShadow:
              "inset 0 3px 14px rgba(24,22,20,0.22), inset 0 -6px 16px rgba(255,255,255,0.25), 0 18px 30px -14px rgba(24,22,20,0.35)",
          }}
          aria-hidden
        />

        {/* Rotating lid rim with a pointer notch */}
        <div
          className="absolute inset-0 rounded-full border-[3px] border-ink/10 transition-transform duration-700 ease-out motion-reduce:transition-none"
          style={{ transform: `rotate(${lidRotation}deg)` }}
          aria-hidden
        >
          <span
            className={cn(
              "absolute -top-[7px] left-1/2 size-3.5 -translate-x-1/2 rotate-45 rounded-[3px] bg-turmeric shadow-sm transition-opacity duration-200",
              activeCategory ? "opacity-100" : "opacity-0"
            )}
          />
        </div>

        <ul className="contents">
          {categories.map((category, i) => {
            const angle = i * anglePerWell - 90;
            const radius = 37;
            const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
            const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
            const isActive = category.slug === activeSlug;
            const Icon = getDabbaIcon(category.icon);

            return (
              <li
                key={category.id}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <Link
                  href={isActive ? "/menu" : `/menu?category=${category.slug}`}
                  aria-pressed={isActive}
                  className={cn(
                    "flex size-14 items-center justify-center rounded-full border bg-card shadow-md transition-all duration-200 sm:size-16",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    isActive
                      ? "-translate-y-1 border-turmeric shadow-lg ring-2 ring-turmeric/40"
                      : "border-steel/60 hover:-translate-y-0.5 hover:shadow-lg"
                  )}
                >
                  <Icon className={cn("size-6", isActive ? "text-turmeric" : "text-ink/70")} />
                  <span className="sr-only">{category.name}</span>
                </Link>
                <span
                  className={cn(
                    "hidden font-mono text-[0.65rem] tracking-wide uppercase sm:block",
                    isActive ? "text-turmeric" : "text-ink/50"
                  )}
                >
                  {category.name}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="font-mono text-xs text-ink/55" aria-live="polite">
        {activeCategory ? (
          <>
            Showing <span className="text-ink">{activeCategory.name}</span>
            {" · "}
            <Link href="/menu" className="underline decoration-steel underline-offset-2 hover:text-ink">
              show everything
            </Link>
          </>
        ) : (
          "Showing everything — pick a well to filter"
        )}
      </p>
    </div>
  );
}
