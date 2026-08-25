import { Section, SectionHeading } from "@/components/layout/section";
import { MotionGroup, MotionItem } from "@/components/motion/reveal";
import { getFeaturedReviews } from "@/lib/data/home";

export async function ReviewsSection() {
  const reviews = await getFeaturedReviews();
  if (reviews.length === 0) return null;

  return (
    <Section className="border-t border-steel/40">
      <MotionGroup>
        <MotionItem>
          <SectionHeading
            eyebrow="From the neighbourhood"
            title="What people say after they eat"
          />
        </MotionItem>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {reviews.map((review) => (
            <MotionItem
              key={review.id}
              className="flex flex-col gap-4 rounded-2xl border border-steel/50 bg-card p-6"
            >
              <p
                className="font-mono text-xs tracking-wide text-turmeric"
                aria-label={`Rated ${review.rating} out of 5`}
              >
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
              </p>
              <p className="text-sm leading-relaxed text-ink/75">
                &ldquo;{review.quote}&rdquo;
              </p>
              <div className="mt-auto text-xs text-ink/50">
                <p className="font-medium text-ink/70">{review.customerName}</p>
                {review.detail && <p>{review.detail}</p>}
              </div>
            </MotionItem>
          ))}
        </div>
      </MotionGroup>
    </Section>
  );
}
