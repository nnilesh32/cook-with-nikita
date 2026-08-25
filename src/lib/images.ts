/**
 * Central image map — every placeholder photo on the site is listed here
 * and nowhere else. Swap a placeholder for one of Nikita's real photos by
 * editing the `src` on the relevant entry; nothing else needs to change.
 * See CONTENT.md for the full swap checklist before launch.
 *
 * Placeholders are curated stock photos hotlinked from Unsplash's CDN
 * (images.unsplash.com), each picked by hand for the brief's brand
 * direction (overhead spreads, hands-in-frame, warm light, real home
 * kitchens — not restaurant-chain styling). Unsplash retired its old
 * keyword-redirect endpoint (source.unsplash.com), so these are specific,
 * license-free photos rather than a live keyword lookup; `next.config.ts`
 * allows the `images.unsplash.com` host so `next/image` can optimise them.
 */

export type ImageAsset = {
  /** Image URL — swap this for a real photo to replace a placeholder. */
  src: string;
  /** Required alt text. Written for the specific photo, not generic. */
  alt: string;
  /** Focal point for object-position, only set where a crop needs it. */
  focus?: "top" | "center" | "bottom";
};

/** Builds a consistently-sized Unsplash CDN URL from a photo id. */
function unsplash(photoId: string, width = 1600) {
  return `https://images.unsplash.com/${photoId}?q=80&w=${width}&auto=format&fit=crop`;
}

export const images = {
  hero: {
    home: {
      src: unsplash("photo-1786640442878-0c216561af21"),
      alt: "A hand with bangles pressing fresh roti dough on a hot tawa over a gas flame, steel vessels in the background",
      focus: "center",
    },
  },

  about: {
    kitchen: {
      src: unsplash("photo-1768729340731-85e386e62529"),
      alt: "Elderly hands grinding spices with a stone mortar and pestle in warm afternoon light",
    },
    plated: {
      src: unsplash("photo-1589302168068-964664d93dc0"),
      alt: "A close-up plate of biryani garnished with mint, with bowls of raita in the background",
    },
  },

  // The seven masala dabba wells on /menu — one representative photo per
  // category, used on the category selector and as the /menu section
  // header image.
  categories: {
    curries: {
      src: unsplash("photo-1786222084052-fb6f27bfb135"),
      alt: "An overhead spread of fried fish and vegetable curries in steel and clay bowls on a dark table",
    },
    biryani: {
      src: unsplash("photo-1633945274405-b6c8069047b0"),
      alt: "An overhead platter of biryani rice studded with meat, lime and pomegranate seeds",
    },
    snacks: {
      src: unsplash("photo-1601050690597-df0568f70950"),
      alt: "Golden fried samosas on a wooden tray with green chutney and pomegranate seeds",
    },
    breads: {
      src: unsplash("photo-1780907084884-ded9fddbb474"),
      alt: "A fresh roti with charred spots cooking on a well-seasoned iron tawa",
    },
    sweets: {
      src: unsplash("photo-1758910536889-43ce7b3199fd"),
      alt: "Trays of colourful Indian mithai — laddoo, barfi and rasgulla — in a sweet shop display case",
    },
    pickles: {
      src: unsplash("photo-1659694459412-02735752031f"),
      alt: "Two glass jars of homemade oil pickle sitting in the sun on a balcony ledge",
    },
    classKits: {
      src: unsplash("photo-1716816211590-c15a328a5ff0"),
      alt: "Whole and ground spices — turmeric, chilli, cardamom — arranged on a dark tabletop",
    },
  },

  pages: {
    classes: {
      src: unsplash("photo-1683105555403-4c4cae4e2298"),
      alt: "Three people laughing together while cooking at a kitchen counter",
    },
    catering: {
      src: unsplash("photo-1555244162-803834f70033"),
      alt: "A catering spread of warming dishes with fresh flowers along the table",
    },
  },
} as const;

/** The homepage's Instagram-style gallery strip — a hand-picked subset
 * of the photos above, reused rather than re-curated. */
export const homeGallery: ImageAsset[] = [
  images.categories.biryani,
  images.categories.sweets,
  images.about.kitchen,
  images.categories.snacks,
  images.categories.pickles,
  images.categories.breads,
];
