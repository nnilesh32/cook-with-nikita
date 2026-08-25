import { AboutTeaser } from "@/components/marketing/about-teaser";
import { ClassesTeaser } from "@/components/marketing/classes-teaser";
import { GalleryPreview } from "@/components/marketing/gallery-preview";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { NewsletterSection } from "@/components/marketing/newsletter-section";
import { ReviewsSection } from "@/components/marketing/reviews-section";
import { TodaysSpecials } from "@/components/marketing/todays-specials";

// Today's specials and sold-out state change through the day — this page
// reads the database on every request rather than being frozen at build
// time.
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <TodaysSpecials />
      <HowItWorks />
      <ClassesTeaser />
      <AboutTeaser />
      <ReviewsSection />
      <GalleryPreview />
      <NewsletterSection />
    </main>
  );
}
