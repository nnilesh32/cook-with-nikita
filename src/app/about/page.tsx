import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Section } from "@/components/layout/section";
import { MotionGroup, MotionItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { images } from "@/lib/images";

export const metadata: Metadata = {
  title: "About",
  description:
    "I'm Nikita — I cook out of my own home kitchen, licensed under FSSAI, everything made fresh the morning it goes out.",
};

// The menu/class counts below are real numbers, not copy — keep them off
// the build-time static cache so they don't drift.
export const dynamic = "force-dynamic";

const credentials = [
  "Registered and operating under FSSAI's home-kitchen category — certificate available on request.",
  "Every dish is cooked to order in small batches. Nothing sits pre-made, nothing gets reheated for delivery.",
  "Vegetables, meat and spices are bought fresh on the morning I cook, not stocked in bulk.",
  "Packed in food-grade containers and sealed for transit — what leaves the kitchen is what arrives at your door.",
] as const;

export default async function AboutPage() {
  const [dishCount, classCount] = await Promise.all([
    db.product.count({ where: { isAvailable: true } }),
    db.classSession.count(),
  ]);
  const stats = [
    { label: "Dishes on the menu", value: String(dishCount) },
    { label: "Classes on the calendar", value: String(classCount) },
    { label: "Reheated for delivery", value: "0" },
  ] as const;

  return (
    <main id="main">
      <Section className="pb-0">
        <MotionGroup className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16">
          <MotionItem>
            <p className="font-mono text-xs tracking-wide text-turmeric uppercase">
              About
            </p>
            <h1 className="mt-3 text-4xl leading-[1.1] font-medium tracking-tight text-ink sm:text-5xl">
              This started as one dabba, dropped off on a Tuesday.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink/70">
              I&apos;m Nikita. I&apos;ve been cooking since I was tall enough
              to reach the stove, and at some point I started doing it for
              other people too — one dabba at a time, out of the same
              kitchen I cook in every day. Nothing here is a restaurant
              recipe scaled up. It&apos;s what I&apos;d make if you were
              coming over.
            </p>
          </MotionItem>

          <MotionItem className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-steel/60 shadow-xl shadow-ink/10">
            <Image
              src={images.about.kitchen.src}
              alt={images.about.kitchen.alt}
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
              priority
            />
          </MotionItem>
        </MotionGroup>
      </Section>

      <Section>
        <MotionGroup className="grid gap-3 border-y border-steel/40 py-8 sm:grid-cols-3">
          {stats.map((stat) => (
            <MotionItem key={stat.label} className="text-center sm:text-left">
              <p className="font-mono text-2xl text-ink">{stat.value}</p>
              <p className="mt-1 text-xs text-ink/55">{stat.label}</p>
            </MotionItem>
          ))}
        </MotionGroup>
      </Section>

      <Section className="grid gap-10 border-t border-steel/40 lg:grid-cols-2">
        <MotionGroup className="contents">
          <MotionItem className="flex flex-col gap-4 text-ink/70">
            <p className="leading-relaxed">
              It started with a neighbour who worked long hours and missed
              home food. Then her colleague. Then a WhatsApp group that
              wouldn&apos;t stop growing. I never set out to run a kitchen
              business — I just kept saying yes, and eventually the yeses
              needed a menu.
            </p>
            <p className="leading-relaxed">
              What hasn&apos;t changed: I still shop the morning I cook, I
              still taste everything twice, and I still won&apos;t send out
              a dish I wouldn&apos;t serve at my own table. If something
              doesn&apos;t taste right, it doesn&apos;t go out — even if
              that means telling someone their order&apos;s delayed.
            </p>
            <p className="leading-relaxed">
              The classes started the same way — people kept asking how a
              dish was made, so I started teaching it instead of just
              explaining it over the phone.
            </p>
          </MotionItem>

          <MotionItem className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-steel/50 lg:aspect-auto">
            <Image
              src={images.about.plated.src}
              alt={images.about.plated.alt}
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </MotionItem>
        </MotionGroup>
      </Section>

      <Section className="border-t border-steel/40 bg-card/40">
        <MotionGroup className="mx-auto max-w-2xl">
          <MotionItem>
            <p className="font-mono text-xs tracking-wide text-turmeric uppercase">
              Hygiene & sourcing
            </p>
            <h2 className="mt-2 text-3xl font-medium tracking-tight text-ink">
              How the kitchen actually runs
            </h2>
          </MotionItem>

          <ul className="mt-8 flex flex-col gap-5">
            {credentials.map((line) => (
              <MotionItem
                key={line}
                className="flex gap-3 border-b border-steel/30 pb-5 text-sm leading-relaxed text-ink/70 last:border-0"
              >
                <span
                  className="mt-1 size-1.5 shrink-0 rounded-full bg-coriander"
                  aria-hidden
                />
                {line}
              </MotionItem>
            ))}
          </ul>
        </MotionGroup>
      </Section>

      <Section className="border-t border-steel/40 text-center">
        <MotionGroup>
          <MotionItem className="mx-auto flex max-w-lg flex-col items-center gap-6">
            <h2 className="text-3xl font-medium tracking-tight text-ink">
              Come hungry, or just curious.
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" render={<Link href="/menu" />}>
                See today&apos;s menu
              </Button>
              <Button size="lg" variant="outline" render={<Link href="/faq" />}>
                Read the FAQ
              </Button>
            </div>
          </MotionItem>
        </MotionGroup>
      </Section>
    </main>
  );
}
