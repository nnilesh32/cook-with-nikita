"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Keeps a server-rendered page live without a client-side status-fetch
 * endpoint — every 20s it re-runs the server component, so a status
 * change made from /admin shows up here on its own.
 */
export function AutoRefresh({ intervalMs = 20_000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
