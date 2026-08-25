/** A cart line is keyed by its exact configuration, so adding the same
 * dish with the same variant, add-ons and spice level increments
 * quantity instead of creating a duplicate row — but a different spice
 * level or add-on set is a genuinely different line. */
export function buildLineId(
  productId: string,
  variantId: string | null,
  addOnIds: string[],
  spiceLevel?: number | null
) {
  return [productId, variantId ?? "base", ...[...addOnIds].sort(), `spice-${spiceLevel ?? "none"}`].join("::");
}
