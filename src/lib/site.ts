/** Canonical origin for absolute URLs — sitemap entries, JSON-LD,
 * Open Graph images. Set NEXT_PUBLIC_SITE_URL before deploying; falls
 * back to localhost so dev and preview builds still work unset. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

/** Contact placeholders shared across the footer, contact page, and
 * order confirmation's "message the kitchen" link. See CONTENT.md. */
export const WHATSAPP_NUMBER = "919876543210";
export const WHATSAPP_DISPLAY = "+91 98765 43210";

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
