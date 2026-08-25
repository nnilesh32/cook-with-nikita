import type { Metadata } from "next";

import { EnquiryForm } from "@/components/enquiries/enquiry-form";
import { Section } from "@/components/layout/section";
import { whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Catering",
  description: "Home-style catering for birthdays, pujas, office lunches and small weddings — tell me about your event.",
};

const HIGHLIGHTS = [
  { title: "20 to 300 guests", detail: "Small home gatherings up to full wedding functions." },
  { title: "Tastings available", detail: "For events over 50 guests, we'll do a tasting before you commit." },
  { title: "Full service or drop-off", detail: "Staffed buffet service, or containers delivered to your venue." },
];

export default function CateringPage() {
  return (
    <main id="main">
      <Section className="grid gap-12 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="font-mono text-xs tracking-wide text-turmeric uppercase">Catering</p>
          <h1 className="mt-2 text-4xl font-medium tracking-tight text-ink sm:text-5xl">
            Bring the kitchen to your next event.
          </h1>
          <p className="mt-4 text-ink/65">
            Same food, scaled up — I plan the menu around your guest count, dietary needs and venue,
            and either cook on-site or deliver ready to serve. Tell me the details below and I&apos;ll
            get back to you with a quote, usually within a day.
          </p>

          <ul className="mt-8 flex flex-col gap-5">
            {HIGHLIGHTS.map((h) => (
              <li key={h.title} className="border-l-2 border-turmeric/60 pl-4">
                <p className="text-sm font-medium text-ink">{h.title}</p>
                <p className="mt-0.5 text-sm text-ink/60">{h.detail}</p>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-sm text-ink/50">
            Prefer to talk it through?{" "}
            <a
              href={whatsappLink("Hi Nikita! I'd like to ask about catering for an event.")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink underline decoration-steel underline-offset-2 hover:text-turmeric"
            >
              Message the kitchen on WhatsApp
            </a>
            .
          </p>
        </div>

        <div>
          <EnquiryForm type="CATERING" />
        </div>
      </Section>
    </main>
  );
}
