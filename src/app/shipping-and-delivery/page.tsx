import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/components/legal/legal-page";
import { FREE_DELIVERY_THRESHOLD, KITCHEN_AREA, MINIMUM_ORDER_VALUE, PACKAGING_FEE } from "@/lib/serviceability";

export const metadata: Metadata = { title: "Shipping & delivery" };

export default function ShippingAndDeliveryPage() {
  return (
    <LegalPage eyebrow="Legal" title="Shipping & delivery" updated="19 August 2026">
      <p>
        Everything ships from one kitchen in {KITCHEN_AREA} — there&apos;s no warehouse or courier network
        behind this, just a rider (or me) heading out with your order.
      </p>

      <h2>Delivery area</h2>
      <p>
        I currently deliver to a set of pincodes across Mumbai&apos;s western suburbs. Enter your pincode on
        the <Link href="/menu">menu</Link> or at checkout to see instantly whether I reach you — outside that
        zone, pickup from the kitchen is always available, whatever your address.
      </p>

      <h2>Fees & minimums</h2>
      <ul>
        <li>Delivery orders need a minimum item total of ₹{MINIMUM_ORDER_VALUE}.</li>
        <li>Delivery fees vary by zone and are shown before you pay — never a surprise at the door.</li>
        <li>Delivery is free above ₹{FREE_DELIVERY_THRESHOLD} in item total.</li>
        <li>A flat ₹{PACKAGING_FEE} packaging fee applies to delivery orders, to cover proper insulated packing.</li>
        <li>Pickup has no minimum and no packaging fee.</li>
      </ul>

      <h2>Timing</h2>
      <p>
        You pick a delivery or pickup slot at checkout based on real-time kitchen capacity — once it&apos;s
        confirmed, that&apos;s roughly when to expect it. Same-day slots close at 8pm; some dishes need a
        full day&apos;s notice, which is called out on the item itself.
      </p>

      <h2>Pantry shop orders</h2>
      <p>
        Pickles and class kits are shelf-stable and travel the same way as the rest of an order — delivered
        or picked up, not separately shipped by courier. There&apos;s currently no shipping outside the
        delivery zone above.
      </p>

      <h2>If something goes wrong in transit</h2>
      <p>
        Message me on WhatsApp with a photo if anything arrives damaged, spilled or wrong — see the{" "}
        <Link href="/refund-policy">refund policy</Link> for how that&apos;s made right.
      </p>
    </LegalPage>
  );
}
