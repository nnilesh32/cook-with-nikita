"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ItemOptionsForm } from "@/components/menu/item-options-form";
import type { MenuProduct } from "@/lib/data/menu";

export function ItemOptionsDialog({
  product,
  trigger,
}: {
  product: MenuProduct;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>{product.description}</DialogDescription>
        </DialogHeader>
        <ItemOptionsForm product={product} onAdded={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
