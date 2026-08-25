import { MessageCircle } from "lucide-react";
import type { Metadata } from "next";

import { Section } from "@/components/layout/section";
import { EnquiryForm } from "@/components/enquiries/enquiry-form";
import { KITCHEN_AREA } from "@/lib/serviceability";
import { WHATSAPP_DISPLAY, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions about an order, a class or anything else — message the kitchen or send a note.",
};

export default function ContactPage() {
  return (
    <main id="main">
      <Section className="grid gap-12 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="font-mono text-xs tracking-wide text-turmeric uppercase">Contact</p>
          <h1 className="mt-2 text-4xl font-medium tracking-tight text-ink sm:text-5xl">Get in touch.</h1>
          <p className="mt-4 text-ink/65">
            For anything about an existing order, WhatsApp is fastest. For everything else — feedback,
            press, a question about the menu — send a note below and I&apos;ll reply myself.
          </p>

          <dl className="mt-8 flex flex-col gap-4 text-sm">
            <div>
              <dt className="text-ink/45">Kitchen hours</dt>
              <dd className="mt-0.5 text-ink">Tuesday–Sunday, 11am–9pm · Closed Mondays</dd>
            </div>
            <div>
              <dt className="text-ink/45">Kitchen</dt>
              <dd className="mt-0.5 text-ink">{KITCHEN_AREA}</dd>
            </div>
            <div>
              <dt className="text-ink/45">WhatsApp</dt>
              <dd className="mt-0.5">
                <a
                  href={whatsappLink("Hi Nikita!")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-ink underline decoration-steel underline-offset-2 hover:text-turmeric"
                >
                  <MessageCircle className="size-4" />
                  {WHATSAPP_DISPLAY}
                </a>
              </dd>
            </div>
          </dl>

          <div className="mt-8 overflow-hidden rounded-2xl border border-steel/50">
            <iframe
              title="Kitchen location"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(KITCHEN_AREA)}&z=14&output=embed`}
              className="h-64 w-full grayscale-[0.3]"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <div>
          <EnquiryForm type="CONTACT" />
        </div>
      </Section>
    </main>
  );
}
