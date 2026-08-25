import { SPICE_LABELS } from "@/lib/spice";
import { cn } from "@/lib/utils";

/** Lucide doesn't ship a chilli glyph, so this draws one in the same
 * stroke style (24x24, round caps/joins) to sit comfortably next to the
 * rest of the icon set. */
function ChilliIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M14.8 4.2c1.1 0 2 .9 1.8 2-.2 1-1 1.6-1.8 1.9M8.2 8.4C5 10 3 13 3 16.3 3 19 5.2 21 8 21c6 0 13-6.7 13-13.4 0-1.7-.6-3.1-1.7-4.1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Spice level as 1–3 chilli glyphs (0 renders nothing — most breads and
 * sweets have no spice level worth showing). */
export function SpiceGlyphs({ level, className }: { level: number; className?: string }) {
  if (level <= 0) return null;

  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={SPICE_LABELS[level] ?? `Spice level ${level}`}
    >
      {[1, 2, 3].map((step) => (
        <ChilliIcon
          key={step}
          className={cn("size-3.5", step <= level ? "text-kashmiri" : "text-steel")}
        />
      ))}
    </span>
  );
}
