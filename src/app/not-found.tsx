import Link from "next/link";

import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main">
      <Section className="flex flex-col items-center gap-3 text-center">
        <p className="font-mono text-xs tracking-wide text-turmeric uppercase">404</p>
        <h1 className="text-3xl font-medium tracking-tight text-ink sm:text-4xl">
          Nothing&apos;s cooking at this address.
        </h1>
        <p className="max-w-sm text-ink/60">
          The page you&apos;re looking for doesn&apos;t exist, or the link&apos;s gone stale. Here&apos;s
          where I&apos;d start instead.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Button size="lg" render={<Link href="/menu" />}>
            Browse the menu
          </Button>
          <Button size="lg" variant="outline" render={<Link href="/" />}>
            Back home
          </Button>
        </div>
      </Section>
    </main>
  );
}
