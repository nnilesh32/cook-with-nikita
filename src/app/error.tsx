"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="font-mono text-xs tracking-wide text-kashmiri uppercase">Something broke</p>
      <h1 className="text-2xl font-medium tracking-tight text-ink">
        That didn&apos;t load right.
      </h1>
      <p className="max-w-sm text-ink/60">
        Nothing you did wrong — something failed on this end. Try again, and if it keeps happening,
        message the kitchen on WhatsApp and I&apos;ll sort it out.
      </p>
      <Button size="lg" className="mt-2" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
