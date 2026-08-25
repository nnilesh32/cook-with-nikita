import { Section } from "@/components/layout/section";
import { MotionGroup, MotionItem } from "@/components/motion/reveal";
import { NewsletterForm } from "@/components/marketing/newsletter-form";

export function NewsletterSection() {
  return (
    <Section className="border-t border-steel/40">
      <MotionGroup className="mx-auto flex max-w-2xl flex-col items-center rounded-3xl border border-steel/50 bg-card px-8 py-14 text-center">
        <MotionItem>
          <p className="font-mono text-xs tracking-wide text-turmeric uppercase">
            Stay in the loop
          </p>
          <h2 className="mt-2 text-3xl font-medium tracking-tight text-ink">
            New dishes, recipes, and the odd sold-out warning
          </h2>
          <p className="mt-3 text-ink/60">
            One email a week, when there&apos;s something worth cooking. No
            spam, unsubscribe whenever.
          </p>
        </MotionItem>
        <MotionItem className="mt-6 w-full max-w-sm">
          <NewsletterForm />
        </MotionItem>
      </MotionGroup>
    </Section>
  );
}
