/** Single source for spice-level labels — the picker on the item
 * configurator, the glyph's accessible name, and anywhere an order later
 * needs to show what was actually requested (order confirmation,
 * tracking, admin) all read from here instead of hand-copying the same
 * three words. Index 0 is "no spice level set" for glyphs; the picker
 * itself only ever offers 1–3. */
export const SPICE_LABELS: Record<number, string> = {
  0: "No spice",
  1: "Mild",
  2: "Medium",
  3: "Hot",
};

export function spiceLevelLabel(level: number | null | undefined): string | null {
  if (level == null) return null;
  return SPICE_LABELS[level] ?? null;
}
