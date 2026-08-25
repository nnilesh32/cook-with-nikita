import type { Metadata } from "next";

import { Section } from "@/components/layout/section";
import { CartPageContent } from "@/components/cart/cart-page-content";

export const metadata: Metadata = {
  title: "Your cart",
  description: "Review what you've picked before checking out.",
};

export default function CartPage() {
  return (
    <main id="main">
      <Section>
        <h1 className="text-3xl font-medium tracking-tight text-ink sm:text-4xl">Your cart</h1>
        <div className="mt-10">
          <CartPageContent />
        </div>
      </Section>
    </main>
  );
}
