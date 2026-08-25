"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { cancelOrderAction, reorderAction } from "@/app/actions/account";
import { signOutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";

export function ReorderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const addLine = useCartStore((s) => s.addLine);
  const [pending, startTransition] = useTransition();

  function handleReorder() {
    startTransition(async () => {
      const result = await reorderAction(orderId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      if (result.lines.length === 0) {
        toast.error("Nothing from that order is available right now.");
        return;
      }
      result.lines.forEach((line) => addLine(line));
      if (result.skipped.length > 0) {
        toast.warning(`Added the rest — ${result.skipped.join(", ")} isn't available today.`);
      } else {
        toast.success("Added to your cart.");
      }
      router.push("/cart");
    });
  }

  return (
    <Button size="sm" variant="outline" onClick={handleReorder} disabled={pending}>
      {pending ? "Adding…" : "Reorder"}
    </Button>
  );
}

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleCancel() {
    startTransition(async () => {
      const result = await cancelOrderAction(orderId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Order cancelled.");
      router.refresh();
    });
  }

  return (
    <Button size="sm" variant="outline" onClick={handleCancel} disabled={pending}>
      {pending ? "Cancelling…" : "Cancel order"}
    </Button>
  );
}

export function SignOutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      await signOutAction();
      router.refresh();
    });
  }

  return (
    <Button size="sm" variant="ghost" onClick={handleSignOut} disabled={pending}>
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}
