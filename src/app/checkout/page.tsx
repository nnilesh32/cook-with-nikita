import type { Metadata } from "next";

import { CheckoutFlow } from "@/components/checkout/checkout-flow";
import { Section } from "@/components/layout/section";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Fulfilment, timing, your details, and payment — four steps, no account required.",
};

export default function CheckoutPage() {
  return (
    <main id="main">
      <Section>
        <h1 className="text-3xl font-medium tracking-tight text-ink sm:text-4xl">Checkout</h1>
        <div className="mt-10">
          <CheckoutFlow />
        </div>
      </Section>
    </main>
  );
}
