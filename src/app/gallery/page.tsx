import type { Metadata } from "next";

import { Section } from "@/components/layout/section";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { images } from "@/lib/images";

export const metadata: Metadata = {
  title: "Gallery",
  description: "A look inside the kitchen — the food, the classes and the process.",
};

const GALLERY_IMAGES = [
  images.categories.biryani,
  images.about.kitchen,
  images.categories.sweets,
  images.pages.classes,
  images.categories.snacks,
  images.about.plated,
  images.categories.pickles,
  images.categories.curries,
  images.pages.catering,
  images.categories.breads,
  images.categories.classKits,
  images.hero.home,
];

export default function GalleryPage() {
  return (
    <main id="main">
      <Section className="pb-0">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs tracking-wide text-turmeric uppercase">Gallery</p>
          <h1 className="mt-2 text-4xl font-medium tracking-tight text-ink sm:text-5xl">A look inside.</h1>
          <p className="mt-3 text-ink/65">The food, the classes, and the process behind both.</p>
        </div>
      </Section>

      <Section className="pt-10">
        <GalleryGrid images={GALLERY_IMAGES} />
      </Section>
    </main>
  );
}
