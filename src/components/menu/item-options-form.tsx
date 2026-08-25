"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { buildLineId } from "@/lib/cart-utils";
import { formatINR } from "@/lib/currency";
import type { MenuProduct } from "@/lib/data/menu";
import { SPICE_LABELS } from "@/lib/spice";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";

const SPICE_LEVELS = [1, 2, 3] as const;

const NOTE_LIMIT = 200;

/**
 * The configurator shared by the /menu grid's "Add" dialog and the
 * /menu/[slug] detail page — portion, spice, add-ons, notes, quantity,
 * a live-updating total, and the add-to-cart action itself.
 */
export function ItemOptionsForm({
  product,
  onAdded,
}: {
  product: MenuProduct;
  onAdded?: () => void;
}) {
  const [variantId, setVariantId] = useState<string | null>(
    product.variants.find((v) => v.isDefault)?.id ?? product.variants[0]?.id ?? null
  );
  const [addOnIds, setAddOnIds] = useState<string[]>([]);
  const [spice, setSpice] = useState(Math.max(product.spiceLevel, 1));
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);

  const addLine = useCartStore((state) => state.addLine);

  const variant = product.variants.find((v) => v.id === variantId) ?? null;
  const selectedAddOns = product.addOns.filter((a) => addOnIds.includes(a.id));
  const unitPrice =
    product.basePrice + (variant?.priceDelta ?? 0) + selectedAddOns.reduce((sum, a) => sum + a.price, 0);
  const total = unitPrice * quantity;

  function toggleAddOn(id: string, checked: boolean) {
    setAddOnIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  }

  function handleAdd() {
    // Only dishes with a spice picker (product.spiceLevel > 0) get a
    // requested spice level at all — otherwise `spice`'s default state
    // would fabricate one that was never actually offered as a choice.
    const requestedSpice = product.spiceLevel > 0 ? spice : null;
    const spiceOption = requestedSpice ? [{ label: `${SPICE_LABELS[requestedSpice]} spice`, priceDelta: 0 }] : [];

    addLine({
      id: buildLineId(product.id, variantId, addOnIds, requestedSpice),
      productId: product.id,
      variantId,
      addOnIds,
      spiceLevel: requestedSpice,
      name: variant ? `${product.name} (${variant.label})` : product.name,
      image: product.image,
      unitPrice,
      quantity,
      options: [...spiceOption, ...selectedAddOns.map((a) => ({ label: a.name, priceDelta: a.price }))],
      note: notes.trim() || undefined,
    });
    toast.success(`Added ${product.name} to your cart.`, {
      description: `${quantity} × ${formatINR(unitPrice)}`,
    });
    setQuantity(1);
    setNotes("");
    setAddOnIds([]);
    onAdded?.();
  }

  return (
    <div className="flex flex-col gap-6">
      {product.variants.length > 0 && (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-ink">Portion</legend>
          <RadioGroup value={variantId ?? undefined} onValueChange={setVariantId}>
            {product.variants.map((v) => (
              <Label
                key={v.id}
                htmlFor={`variant-${v.id}`}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2.5",
                  variantId === v.id ? "border-turmeric bg-turmeric/10" : "border-steel/50"
                )}
              >
                <span className="flex items-center gap-2 text-sm text-ink">
                  <RadioGroupItem value={v.id} id={`variant-${v.id}`} />
                  {v.label}
                </span>
                <span className="font-mono text-sm text-ink/70">
                  {formatINR(product.basePrice + v.priceDelta)}
                </span>
              </Label>
            ))}
          </RadioGroup>
        </fieldset>
      )}

      {product.spiceLevel > 0 && (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-ink">Spice level</legend>
          <div className="flex gap-2">
            {SPICE_LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                aria-pressed={spice === level}
                onClick={() => setSpice(level)}
                className={cn(
                  "flex-1 rounded-lg border px-3 py-2 text-sm transition-colors",
                  spice === level
                    ? "border-turmeric bg-turmeric/10 text-ink"
                    : "border-steel/50 text-ink/60 hover:border-steel"
                )}
              >
                {SPICE_LABELS[level]}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {product.addOns.length > 0 && (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-ink">Add-ons</legend>
          <div className="flex flex-col gap-2">
            {product.addOns.map((addOn) => (
              <Label
                key={addOn.id}
                htmlFor={`addon-${addOn.id}`}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2.5",
                  addOnIds.includes(addOn.id) ? "border-turmeric bg-turmeric/10" : "border-steel/50"
                )}
              >
                <span className="flex items-center gap-2 text-sm text-ink">
                  <Checkbox
                    id={`addon-${addOn.id}`}
                    checked={addOnIds.includes(addOn.id)}
                    onCheckedChange={(checked) => toggleAddOn(addOn.id, checked === true)}
                  />
                  {addOn.name}
                </span>
                <span className="font-mono text-sm text-ink/70">+{formatINR(addOn.price)}</span>
              </Label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor={`notes-${product.id}`} className="text-sm font-medium text-ink">
          Special instructions
        </Label>
        <Textarea
          id={`notes-${product.id}`}
          value={notes}
          maxLength={NOTE_LIMIT}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything I should know — less spicy, no onions, ring the bell twice…"
          className="resize-none"
          rows={2}
        />
        <p className="text-right font-mono text-xs text-ink/40">
          {notes.length}/{NOTE_LIMIT}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between rounded-lg border border-steel/50 bg-card px-3 py-2">
          <span className="text-sm text-ink/60">Quantity</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              disabled={quantity <= 1}
              className="flex size-7 items-center justify-center rounded-full border border-steel/60 text-ink hover:bg-muted disabled:opacity-40"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-4 text-center font-mono text-sm text-ink">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(20, q + 1))}
              aria-label="Increase quantity"
              className="flex size-7 items-center justify-center rounded-full border border-steel/60 text-ink hover:bg-muted"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
        </div>

        <Button size="xl" className="w-full justify-between" onClick={handleAdd}>
          <span>Add to cart</span>
          <span className="font-mono">{formatINR(total)}</span>
        </Button>
      </div>
    </div>
  );
}
