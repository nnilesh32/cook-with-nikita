import type { Metadata } from "next";

import { ClassCard } from "@/components/classes/class-card";
import { Section } from "@/components/layout/section";
import { getUpcomingClasses } from "@/lib/data/classes";

export const metadata: Metadata = {
  title: "Classes",
  description: "Hands-on and online cooking classes with Nikita — small groups, real technique, no recipe cards required after.",
};
export const dynamic = "force-dynamic";

export default async function ClassesPage() {
  const classes = await getUpcomingClasses();

  return (
    <main id="main">
      <Section className="pb-0">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs tracking-wide text-turmeric uppercase">Classes</p>
          <h1 className="mt-2 text-4xl font-medium tracking-tight text-ink sm:text-5xl">
            Cook it once with me, and it&apos;s yours for good.
          </h1>
          <p className="mt-3 text-ink/65">
            Small groups, in my kitchen or over video — pick a class and reserve a seat.
          </p>
        </div>
      </Section>

      <Section className="pt-10">
        {classes.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-steel/60 py-20 text-center">
            <p className="text-lg font-medium text-ink">No classes scheduled right now.</p>
            <p className="max-w-sm text-sm text-ink/55">Check back soon, or message the kitchen to request one.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((c) => (
              <ClassCard key={c.id} classSession={c} />
            ))}
          </div>
        )}
      </Section>
    </main>
  );
}
