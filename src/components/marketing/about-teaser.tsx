import Image from "next/image";
import Link from "next/link";

import { Section } from "@/components/layout/section";
import { MotionGroup, MotionItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { images } from "@/lib/images";

export function AboutTeaser() {
  return (
    <Section className="border-t border-steel/40 bg-card/40">
      <MotionGroup className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <MotionItem className="order-2 lg:order-1">
          <p className="font-mono text-xs tracking-wide text-turmeric uppercase">
            About
          </p>
          <h2 className="mt-2 text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            I started with one order a week, for a neighbour.
          </h2>
          <p className="mt-4 text-ink/65">
            That was a while ago. The kitchen&apos;s grown since, but the
            rule hasn&apos;t changed — I only cook what I&apos;d serve at my
            own table, the same morning it goes out the door.
          </p>
          <Button
            size="lg"
            variant="outline"
            className="mt-6"
            render={<Link href="/about" />}
          >
            Read my story
          </Button>
        </MotionItem>

        <MotionItem className="relative order-1 aspect-[4/3] overflow-hidden rounded-3xl border border-steel/50 lg:order-2">
          <Image
            src={images.about.kitchen.src}
            alt={images.about.kitchen.alt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </MotionItem>
      </MotionGroup>
    </Section>
  );
}
