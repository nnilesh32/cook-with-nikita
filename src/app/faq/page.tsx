import type { Metadata } from "next";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Section } from "@/components/layout/section";
import { MINIMUM_ORDER_VALUE } from "@/lib/serviceability";
import { whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Delivery, spice levels, cancellations, payments and classes — answered.",
};

const FAQ_GROUPS = [
  {
    heading: "Ordering & delivery",
    items: [
      {
        q: "How far in advance do I need to order?",
        a: "Most dishes just need to be ordered by 8pm for delivery or pickup the next slot — check the tag on each item, since cooked-to-order things sell out and some (like the biryani kits and class kits) need a full day's notice.",
      },
      {
        q: "Where do you deliver?",
        a: `I deliver to a set of pincodes around Andheri West, Mumbai — enter yours at checkout and I'll tell you straight away if I reach you. Outside that zone, pickup from the kitchen is always available. Delivery orders need a minimum of ₹${MINIMUM_ORDER_VALUE}.`,
      },
      {
        q: "Can I change or cancel my order?",
        a: "Yes, as long as it's still showing \"Received\" on your tracking page — once I've accepted it and started cooking, I can't take it back. Message me on WhatsApp if you need a change made fast.",
      },
      {
        q: "Do you cook every day?",
        a: "The kitchen's open Tuesday to Sunday, 11am–9pm. I take Mondays off.",
      },
    ],
  },
  {
    heading: "Food & dietary",
    items: [
      {
        q: "How do the spice levels work?",
        a: "Each dish is marked from mild to hot with a simple 1–3 scale on the menu. If you want something adjusted beyond that, add a note at checkout and I'll do my best.",
      },
      {
        q: "Do you cater to Jain or vegetarian diets?",
        a: "Yes — the veg mark on every product tells you whether it's veg, non-veg or Jain (no onion, no garlic). Use the filter on the menu to browse just one.",
      },
      {
        q: "Do you list allergens?",
        a: "Every dish description calls out the obvious ones, but this is a home kitchen with shared equipment, not an allergen-controlled facility — if you have a serious allergy, message me before ordering so I can walk you through exactly what's in a dish.",
      },
    ],
  },
  {
    heading: "Payments",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "Card, UPI and netbanking online at checkout, or cash on delivery/pickup — your choice, every time.",
      },
      {
        q: "I have a coupon code, where do I use it?",
        a: "Add it in the cart before checkout — you'll see the discount applied to your bill immediately if it's valid.",
      },
    ],
  },
  {
    heading: "Classes & catering",
    items: [
      {
        q: "What happens after I book a class?",
        a: "You'll get a confirmation on-screen right away, and I'll message you on WhatsApp before the class with anything you need to bring or set up, if it's online.",
      },
      {
        q: "How does catering pricing work?",
        a: "It depends on guest count, menu and whether you want staffed service or drop-off containers — fill out the catering enquiry and I'll come back with a quote, usually within a day.",
      },
    ],
  },
] as const;

export default function FaqPage() {
  return (
    <main id="main">
      <Section className="max-w-2xl">
        <p className="font-mono text-xs tracking-wide text-turmeric uppercase">FAQ</p>
        <h1 className="mt-2 text-4xl font-medium tracking-tight text-ink sm:text-5xl">Questions, answered.</h1>
        <p className="mt-3 text-ink/65">
          Can&apos;t find what you&apos;re looking for?{" "}
          <a
            href={whatsappLink("Hi Nikita! I have a question.")}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink underline decoration-steel underline-offset-2 hover:text-turmeric"
          >
            Message the kitchen on WhatsApp
          </a>
          .
        </p>

        <div className="mt-10 flex flex-col gap-10">
          {FAQ_GROUPS.map((group) => (
            <div key={group.heading}>
              <p className="text-sm font-medium text-ink">{group.heading}</p>
              <Accordion className="mt-2">
                {group.items.map((item) => (
                  <AccordionItem key={item.q} value={item.q}>
                    <AccordionTrigger>{item.q}</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-ink/65">{item.a}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </Section>
    </main>
  );
}
