import Image from "next/image";
import Link from "next/link";

import { MotionGroup, MotionItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { images } from "@/lib/images";

const trustLine = [
  "FSSAI-licensed home kitchen",
  "Cooked to order, same-day",
  "Order by 8pm for tomorrow",
] as const;

export function Hero() {
  return (
    <section className="relative bg-bone bg-grain">
      <MotionGroup
        trigger="mount"
        stagger={0.1}
        className="mx-auto grid max-w-7xl gap-y-16 px-6 py-20 sm:py-28 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-x-16 lg:px-8"
      >
        <div className="relative z-[2] max-w-xl">
          <MotionItem>
            <span className="inline-flex items-center gap-2 rounded-full border border-steel/70 bg-card px-3 py-1 font-mono text-xs tracking-wide text-ink/70 uppercase">
              <span className="size-1.5 rounded-full bg-coriander" aria-hidden />
              Home-cooked · delivery &amp; pickup
            </span>
          </MotionItem>

          <MotionItem>
            <h1 className="mt-6 text-5xl leading-[1.05] font-medium text-ink sm:text-6xl">
              I cook everything the morning it goes out.
            </h1>
          </MotionItem>

          <MotionItem>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink/70">
              Order home-style curries, biryani and sweets for delivery or
              pickup, book a hands-on cooking class, or bring me in to cook
              for your next get-together.
            </p>
          </MotionItem>

          <MotionItem className="mt-8 flex flex-wrap items-center gap-4">
            <Button size="xl" render={<Link href="/menu" />}>
              See today&apos;s menu
            </Button>
            <Button size="xl" variant="outline" render={<Link href="/classes" />}>
              Book a class
            </Button>
          </MotionItem>

          <MotionItem>
            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
              {trustLine.map((item) => (
                <li
                  key={item}
                  className="font-mono text-xs tracking-tight text-ink/55"
                >
                  {item}
                </li>
              ))}
            </ul>
          </MotionItem>
        </div>

        <MotionItem className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div
            className="absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-br from-steel/80 via-steel/30 to-steel/60"
            aria-hidden
          />
          <div className="aspect-[4/5] overflow-hidden rounded-3xl border border-steel/60 shadow-xl shadow-ink/10">
            <Image
              src={images.hero.home.src}
              alt={images.hero.home.alt}
              width={900}
              height={1125}
              className="h-full w-full object-cover"
              priority
            />
          </div>

          <div className="absolute -bottom-6 -left-4 hidden items-center gap-3 rounded-2xl border border-steel/60 bg-card px-4 py-3 shadow-lg sm:flex">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-turmeric/15 font-mono text-sm text-turmeric">
              7
            </span>
            <div className="leading-tight">
              <p className="font-mono text-[0.65rem] tracking-wide text-ink/50 uppercase">
                Today
              </p>
              <p className="text-sm font-medium text-ink">
                specials on the menu
              </p>
            </div>
          </div>
        </MotionItem>
      </MotionGroup>
    </section>
  );
}
