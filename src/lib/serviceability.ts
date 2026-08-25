/**
 * Delivery zones — placeholder. This is a real small set of Mumbai
 * western-suburb pincodes so the pincode check and distance-banded fee
 * actually work, but it's not Nikita's real service area yet. Swap for
 * the real list before launch — see CONTENT.md.
 */

export type DeliveryZone = {
  pincode: string;
  area: string;
  /** Base delivery fee for this zone, in rupees. Waived automatically
   * above the free-delivery threshold — see FREE_DELIVERY_THRESHOLD. */
  baseFee: number;
};

export const KITCHEN_AREA = "Andheri West, Mumbai";

export const FREE_DELIVERY_THRESHOLD = 500;
export const MINIMUM_ORDER_VALUE = 500;
export const PACKAGING_FEE = 20;
export const GST_RATE = 0.05;

export const SERVICEABLE_ZONES: DeliveryZone[] = [
  { pincode: "400058", area: "Andheri West", baseFee: 0 },
  { pincode: "400053", area: "Versova", baseFee: 0 },
  { pincode: "400047", area: "Vile Parle", baseFee: 30 },
  { pincode: "400049", area: "Santacruz", baseFee: 30 },
  { pincode: "400050", area: "Bandra West", baseFee: 50 },
  { pincode: "400052", area: "Khar", baseFee: 50 },
  { pincode: "400072", area: "Powai", baseFee: 70 },
  { pincode: "400102", area: "Malad West", baseFee: 70 },
];

export type PincodeCheckResult =
  | { serviceable: true; area: string; baseFee: number }
  | { serviceable: false };

export function checkPincode(pincode: string): PincodeCheckResult {
  const zone = SERVICEABLE_ZONES.find((z) => z.pincode === pincode);
  if (!zone) return { serviceable: false };
  return { serviceable: true, area: zone.area, baseFee: zone.baseFee };
}

/** The delivery fee actually charged for a given zone and item total —
 * folds in the free-delivery-above-threshold rule. */
export function deliveryFeeFor(pincode: string, itemTotal: number): number | null {
  const result = checkPincode(pincode);
  if (!result.serviceable) return null;
  return itemTotal >= FREE_DELIVERY_THRESHOLD ? 0 : result.baseFee;
}
