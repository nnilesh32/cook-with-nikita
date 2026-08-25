import "server-only";

import type { MenuProduct, ProductDetail } from "@/lib/data/menu";
import type { RecipeFrontmatter, recipeImage } from "@/lib/data/recipes";
import { KITCHEN_AREA } from "@/lib/serviceability";
import { SITE_URL, WHATSAPP_NUMBER } from "@/lib/site";

/** JSON-LD builders — plain objects, serialized with JSON.stringify and
 * dropped into a `<script type="application/ld+json">` at each call
 * site. Kept as data (not components) so pages stay server components
 * without needing a dangerouslySetInnerHTML wrapper more than once. */

export function restaurantJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "Cook with Nikita",
    description:
      "A home kitchen in Mumbai serving home-style curries, biryani and sweets for delivery or pickup, plus hands-on cooking classes and catering.",
    url: SITE_URL,
    telephone: `+${WHATSAPP_NUMBER}`,
    priceRange: "₹₹",
    servesCuisine: ["Indian", "North Indian", "South Indian"],
    address: {
      "@type": "PostalAddress",
      addressLocality: KITCHEN_AREA,
      addressCountry: "IN",
    },
    hasMenu: `${SITE_URL}/menu`,
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "11:00",
      closes: "21:00",
    },
  };
}

export function productJsonLd(detail: ProductDetail) {
  const { product, reviews } = detail;
  const url = `${SITE_URL}/menu/${product.slug}`;

  const base = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    url,
    offers: {
      "@type": "Offer",
      price: product.basePrice,
      priceCurrency: "INR",
      availability: product.isSoldOutToday
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
      url,
    },
  };

  if (reviews.length === 0) return base;

  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return {
    ...base,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: Math.round(average * 10) / 10,
      reviewCount: reviews.length,
    },
    review: reviews.map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.customerName },
      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
      reviewBody: r.quote,
    })),
  };
}

export function menuJsonLd(products: MenuProduct[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: "Cook with Nikita — full menu",
    hasMenuItem: products.map((p) => ({
      "@type": "MenuItem",
      name: p.name,
      description: p.description,
      offers: { "@type": "Offer", price: p.basePrice, priceCurrency: "INR" },
    })),
  };
}

export function recipeJsonLd(
  frontmatter: RecipeFrontmatter,
  slug: string,
  image: ReturnType<typeof recipeImage>
) {
  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: frontmatter.title,
    description: frontmatter.description,
    image: image.src,
    url: `${SITE_URL}/recipes/${slug}`,
    datePublished: frontmatter.publishedAt,
    author: { "@type": "Person", name: "Nikita" },
    recipeYield: `${frontmatter.servings} servings`,
    prepTime: `PT${frontmatter.prepMinutes}M`,
    cookTime: `PT${frontmatter.cookMinutes}M`,
    totalTime: `PT${frontmatter.prepMinutes + frontmatter.cookMinutes}M`,
    recipeCategory: frontmatter.tags[0],
    recipeCuisine: "Indian",
    recipeIngredient: frontmatter.ingredients.map((i) =>
      [i.quantity, i.unit, i.name].filter(Boolean).join(" ")
    ),
    keywords: frontmatter.tags.join(", "),
  };
}

export function courseJsonLd(classSession: {
  slug: string;
  title: string;
  description: string;
  image: string;
  price: number;
  dateTime: Date;
  durationMinutes: number;
  mode: "ONLINE" | "IN_PERSON";
  reviews: { id: string; rating: number; quote: string; customerName: string }[];
}) {
  const url = `${SITE_URL}/classes/${classSession.slug}`;
  const endDate = new Date(classSession.dateTime.getTime() + classSession.durationMinutes * 60_000);

  const base = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: classSession.title,
    description: classSession.description,
    image: classSession.image,
    url,
    provider: { "@type": "Organization", name: "Cook with Nikita", sameAs: SITE_URL },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: classSession.mode === "ONLINE" ? "online" : "onsite",
      startDate: classSession.dateTime.toISOString(),
      endDate: endDate.toISOString(),
      location:
        classSession.mode === "IN_PERSON"
          ? { "@type": "Place", name: KITCHEN_AREA }
          : undefined,
      offers: { "@type": "Offer", price: classSession.price, priceCurrency: "INR", url },
    },
  };

  if (classSession.reviews.length === 0) return base;

  const average =
    classSession.reviews.reduce((sum, r) => sum + r.rating, 0) / classSession.reviews.length;

  return {
    ...base,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: Math.round(average * 10) / 10,
      reviewCount: classSession.reviews.length,
    },
    review: classSession.reviews.map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.customerName },
      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
      reviewBody: r.quote,
    })),
  };
}
