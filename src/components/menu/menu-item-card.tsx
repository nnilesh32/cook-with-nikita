"use client";

import { Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ItemOptionsDialog } from "@/components/menu/item-options-dialog";
import { SpiceGlyphs } from "@/components/menu/spice-glyphs";
import { VegMark } from "@/components/menu/veg-mark";
import { Button } from "@/components/ui/button";
import { buildLineId } from "@/lib/cart-utils";
import { formatINR } from "@/lib/currency";
import type { MenuProduct } from "@/lib/data/menu";
import { leadTimeLabel } from "@/lib/kitchen";
import { useCartStore } from "@/stores/cart-store";

export function MenuItemCard({ product }: { product: MenuProduct }) {
  const needsConfiguration = product.variants.length > 0 || product.addOns.length > 0 || product.spiceLevel > 0;
  const simpleLineId = buildLineId(product.id, null, []);

  const quantityInCart = useCartStore(
    (state) => state.lines.find((line) => line.id === simpleLineId)?.quantity ?? 0
  );
  const addLine = useCartStore((state) => state.addLine);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeLine = useCartStore((state) => state.removeLine);

  function addSimple() {
    addLine({
      id: simpleLineId,
      productId: product.id,
      variantId: null,
      addOnIds: [],
      name: product.name,
      image: product.image,
      unitPrice: product.basePrice,
      quantity: 1,
    });
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-steel/50 bg-card">
      <Link href={`/menu/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 90vw"
          className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
        />
        <VegMark vegType={product.vegType} className="absolute top-2.5 left-2.5" />
        {product.isTodaysSpecial && (
          <span className="absolute top-2.5 right-2.5 rounded-full bg-turmeric px-2 py-0.5 font-mono text-[0.6rem] tracking-wide text-ink uppercase">
            Today&apos;s special
          </span>
        )}
        {product.isSoldOutToday && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/65">
            <span className="rounded-full bg-bone px-3 py-1 text-xs font-medium text-ink">
              Sold out for today
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/menu/${product.slug}`} className="text-sm font-medium text-ink hover:underline">
            {product.name}
          </Link>
          <SpiceGlyphs level={product.spiceLevel} className="mt-0.5 shrink-0" />
        </div>
        <p className="line-clamp-2 text-xs text-ink/55">{product.description}</p>
        <p className="font-mono text-[0.65rem] text-ink/40">
          Serves {product.servesCount} · {leadTimeLabel(product.leadTimeHours)}
        </p>

        <div className="mt-auto flex items-center justify-between pt-3">
          <p className="font-mono text-sm text-ink transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-turmeric">
            {product.variants.length > 0 && "From "}
            {formatINR(product.basePrice)}
          </p>

          {product.isSoldOutToday ? (
            <Button size="sm" variant="outline" disabled>
              Sold out
            </Button>
          ) : needsConfiguration ? (
            <ItemOptionsDialog product={product} trigger={<Button size="sm">Add</Button>} />
          ) : quantityInCart > 0 ? (
            <div className="flex items-center gap-2 rounded-full border border-steel/60 px-1 py-1">
              <button
                type="button"
                aria-label={quantityInCart === 1 ? `Remove ${product.name}` : `Decrease quantity`}
                onClick={() =>
                  quantityInCart === 1 ? removeLine(simpleLineId) : updateQuantity(simpleLineId, quantityInCart - 1)
                }
                className="flex size-6 items-center justify-center rounded-full text-ink hover:bg-muted"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="w-4 text-center font-mono text-xs text-ink">{quantityInCart}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => updateQuantity(simpleLineId, quantityInCart + 1)}
                className="flex size-6 items-center justify-center rounded-full text-ink hover:bg-muted"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
          ) : (
            <Button size="sm" onClick={addSimple}>
              Add
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
