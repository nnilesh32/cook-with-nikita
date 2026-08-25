"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { getReceivedCountAction } from "@/app/actions/admin";

/** Polls the count of freshly-received orders every 15s. A rising count
 * means a new order landed since the last check — surfaced as a toast
 * and a router.refresh() so whichever admin page is open picks it up,
 * without needing a websocket for a single-admin dashboard. */
export function NewOrderWatcher({ initialCount }: { initialCount: number }) {
  const router = useRouter();
  const lastCount = useRef(initialCount);

  useEffect(() => {
    const interval = setInterval(async () => {
      const count = await getReceivedCountAction();
      if (count > lastCount.current) {
        const diff = count - lastCount.current;
        toast.success(diff === 1 ? "New order just came in." : `${diff} new orders just came in.`, {
          duration: 6000,
        });
        router.refresh();
      }
      lastCount.current = count;
    }, 15_000);
    return () => clearInterval(interval);
  }, [router]);

  return null;
}
