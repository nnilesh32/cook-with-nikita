import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/legal-page";
import { WHATSAPP_DISPLAY } from "@/lib/site";

export const metadata: Metadata = { title: "Refund policy" };

export default function RefundPolicyPage() {
  return (
    <LegalPage eyebrow="Legal" title="Refund policy" updated="19 August 2026">
      <p>
        Food is made to order, so refunds work a little differently than a typical shop — here&apos;s exactly
        how it&apos;s handled.
      </p>

      <h2>Orders</h2>
      <ul>
        <li>
          Cancel before I&apos;ve accepted your order (while it still shows &ldquo;Received&rdquo; on
          tracking) and any online payment is refunded in full to your original payment method, usually
          within 5–7 business days.
        </li>
        <li>
          Once an order&apos;s been accepted and cooking has started, it can&apos;t be cancelled — the
          ingredients are already committed.
        </li>
        <li>
          If something arrives wrong, short, or genuinely not up to standard, message me on WhatsApp with a
          photo within 2 hours of delivery — I&apos;ll make it right with a remake or a refund, whichever
          makes sense.
        </li>
        <li>Cash-on-delivery orders that are cancelled before cooking simply aren&apos;t charged — nothing to refund.</li>
      </ul>

      <h2>Classes</h2>
      <ul>
        <li>Cancel 48 hours or more before the class starts for a full refund.</li>
        <li>Cancel within 48 hours and I can offer a credit toward a future class, but not a cash refund — the seat&apos;s already been held against a small class size.</li>
        <li>If I have to cancel or reschedule a class, you get a full refund or a free move to another date, your choice.</li>
      </ul>

      <h2>Catering</h2>
      <p>
        Deposit refund terms are agreed in writing at the time of booking, since every catering job is
        different — check your confirmation message for the specifics.
      </p>

      <h2>How refunds arrive</h2>
      <p>
        Online payments are refunded back to the same card, UPI or bank account you paid with, through
        Razorpay — I can&apos;t redirect a refund to a different account. It typically takes 5–7 business
        days to show up, depending on your bank.
      </p>

      <h2>Something not covered here?</h2>
      <p>Message {WHATSAPP_DISPLAY} on WhatsApp and I&apos;ll sort it out directly.</p>
    </LegalPage>
  );
}
