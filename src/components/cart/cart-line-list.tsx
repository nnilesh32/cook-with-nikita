"use client";

import { Minus, Plus, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { formatINR } from "@/lib/currency";
import { useCartStore, type CartLine } from "@/stores/cart-store";

export function CartLineList({
  lines,
  showImage = false,
}: {
  lines: CartLine[];
  showImage?: boolean;
}) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeLine = useCartStore((state) => state.removeLine);
  const addLine = useCartStore((state) => state.addLine);

  function handleRemove(line: CartLine) {
    removeLine(line.id);
    toast(`Removed ${line.name}`, {
      action: {
        label: "Undo",
        onClick: () => addLine(line),
      },
    });
  }

  return (
    <ul className="divide-y divide-steel/30">
      {lines.map((line) => (
        <li key={line.id} className="flex gap-3 py-4">
          {showImage && (
            <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-steel/40">
              <Image src={line.image} alt={line.name} fill sizes="64px" className="object-cover" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-ink">{line.name}</p>
              <button
                type="button"
                onClick={() => handleRemove(line)}
                aria-label={`Remove ${line.name} from cart`}
                className="shrink-0 rounded p-0.5 text-ink/40 transition-colors hover:text-kashmiri focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
              >
                <X className="size-4" />
              </button>
            </div>

            {line.options && line.options.length > 0 && (
              <p className="mt-0.5 text-xs text-ink/50">{line.options.map((o) => o.label).join(", ")}</p>
            )}
            {line.note && <p className="mt-0.5 text-xs text-ink/40 italic">&ldquo;{line.note}&rdquo;</p>}

            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2 rounded-full border border-steel/60 px-1 py-1">
                <button
                  type="button"
                  aria-label={line.quantity === 1 ? `Remove ${line.name}` : "Decrease quantity"}
                  onClick={() =>
                    line.quantity === 1 ? handleRemove(line) : updateQuantity(line.id, line.quantity - 1)
                  }
                  className="flex size-6 items-center justify-center rounded-full text-ink hover:bg-muted"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="w-4 text-center font-mono text-xs text-ink">{line.quantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => updateQuantity(line.id, line.quantity + 1)}
                  className="flex size-6 items-center justify-center rounded-full text-ink hover:bg-muted"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
              <p className="font-mono text-sm text-ink">{formatINR(line.unitPrice * line.quantity)}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
