import Link from "next/link";

import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";

export default function ProductNotFound() {
  return (
    <main id="main">
      <Section className="flex flex-col items-center gap-3 text-center">
        <p className="font-mono text-xs tracking-wide text-turmeric uppercase">404</p>
        <h1 className="text-3xl font-medium tracking-tight text-ink">
          That dish isn&apos;t on the menu.
        </h1>
        <p className="max-w-sm text-ink/60">
          It might have been retired, or the link&apos;s just wrong. Here&apos;s everything I&apos;m
          actually cooking.
        </p>
        <Button size="lg" className="mt-2" render={<Link href="/menu" />}>
          Back to the menu
        </Button>
      </Section>
    </main>
  );
}
