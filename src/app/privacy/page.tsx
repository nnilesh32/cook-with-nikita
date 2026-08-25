import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/legal-page";
import { WHATSAPP_DISPLAY } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Legal" title="Privacy policy" updated="19 August 2026">
      <p>
        This is a small home kitchen, and this policy is written the way I&apos;d actually explain it — not
        legal boilerplate for its own sake. It covers what I collect when you order, book a class, or get in
        touch, and what I do with it.
      </p>

      <h2>What I collect</h2>
      <p>To take an order, book a class or answer an enquiry, I collect:</p>
      <ul>
        <li>Your name and phone number, to confirm and contact you about an order or booking</li>
        <li>A delivery address, only if you&apos;re ordering for delivery</li>
        <li>An email address, only if you give one — for class bookings or the newsletter</li>
        <li>Order history and preferences, to speed up reordering and show you your past orders</li>
      </ul>
      <p>
        Signing in uses a one-time code sent to your phone rather than a password — I never see or store a
        password, because there isn&apos;t one.
      </p>

      <h2>How it&apos;s used</h2>
      <p>
        Your details are used to fulfil orders and bookings, to contact you about them (including on
        WhatsApp), and to run the kitchen — nothing more. I don&apos;t sell your information, and I don&apos;t
        share it with anyone outside what&apos;s needed to get your order to you (a delivery rider, for
        instance).
      </p>

      <h2>Payments</h2>
      <p>
        Online payments are processed by Razorpay — I don&apos;t see or store your card, UPI or bank details
        at any point; they go straight to Razorpay&apos;s systems. I only see whether a payment succeeded and a
        reference id for it.
      </p>

      <h2>Cookies & local storage</h2>
      <p>
        Your cart is kept in your browser&apos;s local storage so it survives a page refresh — it isn&apos;t
        sent anywhere until you check out. Signing in sets a session cookie so you don&apos;t have to verify
        your phone on every visit.
      </p>

      <h2>Your data, your call</h2>
      <p>
        You can ask me to see, correct or delete what I hold on you at any time — message me on WhatsApp at{" "}
        {WHATSAPP_DISPLAY} and I&apos;ll sort it out directly, since this is a one-person kitchen, not a data
        team.
      </p>
    </LegalPage>
  );
}
