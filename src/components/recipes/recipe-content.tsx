/** Minimal hand-rolled styling for compiled MDX output — no typography
 * plugin, just enough to make headings/lists/paragraphs read well against
 * the rest of the site's type system. */
export function RecipeContent({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col gap-4 text-sm leading-relaxed text-ink/75
        [&_h2]:mt-4 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-medium [&_h2]:text-ink
        [&_h3]:mt-2 [&_h3]:text-sm [&_h3]:font-medium [&_h3]:tracking-wide [&_h3]:text-turmeric [&_h3]:uppercase
        [&_ol]:flex [&_ol]:list-decimal [&_ol]:flex-col [&_ol]:gap-2.5 [&_ol]:pl-5
        [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-5
        [&_li]:pl-1
        [&_p]:text-ink/75"
    >
      {children}
    </div>
  );
}
