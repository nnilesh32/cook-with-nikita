import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/legal-page";
import { KITCHEN_AREA, MINIMUM_ORDER_VALUE } from "@/lib/serviceability";
import { WHATSAPP_DISPLAY } from "@/lib/site";

export const metadata: Metadata = { title: "Terms of service" };

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Legal" title="Terms of service" updated="19 August 2026">
      <p>
        Cook with Nikita is a licensed home kitchen based in {KITCHEN_AREA}, operating under an FSSAI
        registration. By placing an order, booking a class or making a catering enquiry, you&apos;re agreeing
        to the terms below.
      </p>

      <h2>Orders</h2>
      <ul>
        <li>
          Every item is cooked fresh — most on the same day you order, some sold out or on a next-day lead
          time, as shown on the menu. Prices and availability can change without notice; the price shown at
          checkout is what you pay.
        </li>
        <li>Delivery orders need a minimum item total of ₹{MINIMUM_ORDER_VALUE}. Pickup has no minimum.</li>
        <li>
          An order can be cancelled free of charge only while it&apos;s still &ldquo;Received&rdquo; — once
          I&apos;ve accepted it and started cooking, it can&apos;t be reversed.
        </li>
        <li>Delivery times are estimates tied to the slot you pick, not a guarantee to the minute.</li>
      </ul>

      <h2>Classes</h2>
      <ul>
        <li>Seats are confirmed on payment and are limited — booking early is the only way to guarantee a spot.</li>
        <li>
          If you can&apos;t make it, message me on WhatsApp as early as possible — see the refund policy for
          how cancellations are handled.
        </li>
        <li>Online classes require a stable connection on your end; I&apos;m not responsible for your side of the call.</li>
      </ul>

      <h2>Catering</h2>
      <p>
        Catering quotes are estimates until confirmed in writing. A booking is only locked in once
        we&apos;ve agreed on the menu, guest count and a deposit, where one&apos;s required.
      </p>

      <h2>Accounts</h2>
      <p>
        Signing in with your phone number creates an account automatically — there&apos;s no separate
        sign-up. Keep your phone secure, since a one-time code is all that&apos;s needed to access your order
        history and saved addresses.
      </p>

      <h2>Limits</h2>
      <p>
        This is a home kitchen run by one person — while I take real care with every order, I can&apos;t
        guarantee against delays from weather, traffic or an unusually busy day. I&apos;ll always tell you if
        something&apos;s running late.
      </p>

      <h2>Questions</h2>
      <p>Message {WHATSAPP_DISPLAY} on WhatsApp for anything these terms don&apos;t cover.</p>
    </LegalPage>
  );
}
