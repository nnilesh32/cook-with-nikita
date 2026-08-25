import { Section, SectionHeading } from "@/components/layout/section";
import { MotionGroup, MotionItem } from "@/components/motion/reveal";

const orderingSteps = [
  {
    title: "Pick your dishes",
    description:
      "Browse today's menu and add what you want — portions, spice level and add-ons are all in the same step.",
  },
  {
    title: "Choose delivery or pickup",
    description:
      "Pick a slot that works for you. Pay online, or keep cash ready for delivery.",
  },
  {
    title: "I cook it fresh",
    description:
      "Nothing sits around waiting for an order. It's cooked the same morning it goes out to you.",
  },
] as const;

export function HowItWorks() {
  return (
    <Section className="border-t border-steel/40 bg-card/40">
      <MotionGroup>
        <MotionItem>
          <SectionHeading eyebrow="How it works" title="Three steps, same as always" />
        </MotionItem>

        <div className="mt-10 grid gap-10 sm:grid-cols-3">
          {orderingSteps.map((step, index) => (
            <MotionItem key={step.title} className="flex flex-col gap-3">
              <span className="font-mono text-sm text-turmeric">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="text-lg font-medium text-ink">{step.title}</p>
              <p className="text-sm leading-relaxed text-ink/60">
                {step.description}
              </p>
            </MotionItem>
          ))}
        </div>
      </MotionGroup>
    </Section>
  );
}
