import Link from "next/link";

import { NewsletterForm } from "@/components/marketing/newsletter-form";
import { WHATSAPP_DISPLAY, whatsappLink } from "@/lib/site";

const columns = [
  {
    heading: "Order",
    links: [
      { href: "/menu", label: "Menu" },
      { href: "/classes", label: "Classes" },
      { href: "/catering", label: "Catering" },
      { href: "/shop", label: "Pantry shop" },
    ],
  },
  {
    heading: "Learn",
    links: [
      { href: "/recipes", label: "Recipes" },
      { href: "/about", label: "About Nikita" },
      { href: "/gallery", label: "Gallery" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/refund-policy", label: "Refund policy" },
      { href: "/shipping-and-delivery", label: "Shipping & delivery" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-steel/50 bg-ink text-bone/90">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div className="max-w-sm">
            <p className="font-display text-lg font-medium tracking-tight text-bone">
              Cook with Nikita
            </p>
            <p className="mt-3 text-sm leading-relaxed text-bone/60">
              I&apos;m Nikita — this is my home kitchen, not a restaurant.
              Everything&apos;s cooked to order, a little at a time, the way
              I&apos;d cook for my own family.
            </p>

            <dl className="mt-6 flex flex-col gap-1.5 font-mono text-xs text-bone/50">
              <div className="flex gap-2">
                <dt className="text-bone/35">Kitchen hours</dt>
                <dd>Tue–Sun, 11am–9pm</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-bone/35">WhatsApp</dt>
                <dd>
                  <a
                    href={whatsappLink("Hi Nikita! I have a question about an order.")}
                    className="underline decoration-bone/30 underline-offset-2 hover:text-bone"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {WHATSAPP_DISPLAY}
                  </a>
                </dd>
              </div>
            </dl>

            <div className="mt-8">
              <p className="text-sm font-medium text-bone">
                Get recipes & specials
              </p>
              <p className="mt-1 text-xs text-bone/50">
                One email a week, when there&apos;s something worth cooking.
              </p>
              <NewsletterForm className="mt-3 max-w-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.heading}>
                <p className="font-mono text-xs tracking-wide text-bone/40 uppercase">
                  {column.heading}
                </p>
                <ul className="mt-3 flex flex-col gap-2.5">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-bone/70 transition-colors hover:text-bone"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-bone/10 pt-6 text-xs text-bone/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Cook with Nikita. All rights reserved.</p>
          <p className="font-mono">FSSAI-licensed home kitchen</p>
        </div>
      </div>
    </footer>
  );
}
