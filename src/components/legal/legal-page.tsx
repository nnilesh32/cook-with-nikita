import { Section } from "@/components/layout/section";

export function LegalPage({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main id="main">
      <Section className="max-w-2xl">
        <p className="font-mono text-xs tracking-wide text-turmeric uppercase">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight text-ink sm:text-4xl">{title}</h1>
        <p className="mt-2 font-mono text-xs text-ink/40">Last updated {updated}</p>

        <div
          className="mt-8 flex flex-col gap-4 text-sm leading-relaxed text-ink/70
            [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-medium [&_h2]:text-ink
            [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-5
            [&_li]:pl-1
            [&_a]:text-ink [&_a]:underline [&_a]:decoration-steel [&_a]:underline-offset-2 [&_a]:hover:text-turmeric"
        >
          {children}
        </div>
      </Section>
    </main>
  );
}
