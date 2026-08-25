import Image from "next/image";
import Link from "next/link";

import { Section, SectionHeading } from "@/components/layout/section";
import { MotionGroup, MotionItem } from "@/components/motion/reveal";
import { buttonVariants } from "@/components/ui/button";
import { homeGallery } from "@/lib/images";
import { cn } from "@/lib/utils";

export function GalleryPreview() {
  return (
    <Section className="border-t border-steel/40 bg-card/40">
      <MotionGroup>
        <MotionItem className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="From the kitchen" title="A little bit of everything" />
          <Link href="/gallery" className={cn(buttonVariants({ variant: "outline" }))}>
            See the gallery
          </Link>
        </MotionItem>

        <div className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {homeGallery.map((photo, index) => (
            <MotionItem
              key={index}
              className="group relative aspect-square overflow-hidden rounded-xl border border-steel/50"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="200px"
                className="object-cover transition-transform duration-300 ease-out group-hover:scale-110"
              />
            </MotionItem>
          ))}
        </div>
      </MotionGroup>
    </Section>
  );
}
