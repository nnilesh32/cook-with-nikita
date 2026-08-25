"use client";

import { X } from "lucide-react";
import Image from "next/image";

import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import type { ImageAsset } from "@/lib/images";

export function GalleryGrid({ images }: { images: ImageAsset[] }) {
  return (
    <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
      {images.map((image, i) => (
        <Dialog key={i}>
          <DialogTrigger className="group relative mb-4 block w-full overflow-hidden rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
            <Image
              src={image.src}
              alt={image.alt}
              width={600}
              height={i % 3 === 0 ? 800 : 450}
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            />
          </DialogTrigger>
          <DialogContent
            className="max-w-[calc(100%-2rem)] border-none bg-transparent p-0 shadow-none ring-0 sm:max-w-3xl"
            showCloseButton={false}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
              <Image src={image.src} alt={image.alt} fill sizes="90vw" className="object-cover" />
            </div>
            <DialogClose className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full bg-ink/60 text-bone backdrop-blur-sm transition-colors hover:bg-ink/80">
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}
