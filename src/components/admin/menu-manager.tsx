"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { updateProductAction } from "@/app/actions/admin";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { getAllProductsForAdmin } from "@/lib/data/admin";

type Product = Awaited<ReturnType<typeof getAllProductsForAdmin>>[number];

export function MenuManager({ products }: { products: Product[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Price (₹)</TableHead>
          <TableHead>Daily limit</TableHead>
          <TableHead>Today&apos;s special</TableHead>
          <TableHead>Available</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <ProductRow key={product.id} product={product} />
        ))}
      </TableBody>
    </Table>
  );
}

function ProductRow({ product }: { product: Product }) {
  const [pending, startTransition] = useTransition();

  function save(fields: Parameters<typeof updateProductAction>[0]) {
    startTransition(async () => {
      const result = await updateProductAction(fields);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(`${product.name} updated.`);
    });
  }

  return (
    <TableRow className={pending ? "opacity-60" : undefined}>
      <TableCell className="font-medium text-ink">{product.name}</TableCell>
      <TableCell className="text-ink/60">{product.category.name}</TableCell>
      <TableCell>
        <Input
          type="number"
          defaultValue={product.basePrice}
          className="h-8 w-24"
          onBlur={(e) => {
            const value = Number(e.target.value);
            if (Number.isFinite(value) && value !== product.basePrice) {
              save({ id: product.id, basePrice: value });
            }
          }}
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          defaultValue={product.dailyLimit ?? ""}
          placeholder="Unlimited"
          className="h-8 w-24"
          onBlur={(e) => {
            const raw = e.target.value;
            const value = raw === "" ? null : Number(raw);
            if (value !== product.dailyLimit && (value === null || Number.isFinite(value))) {
              save({ id: product.id, dailyLimit: value });
            }
          }}
        />
      </TableCell>
      <TableCell>
        <Switch
          checked={product.isTodaysSpecial}
          onCheckedChange={(checked) => save({ id: product.id, isTodaysSpecial: checked })}
        />
      </TableCell>
      <TableCell>
        <Switch
          checked={product.isAvailable}
          onCheckedChange={(checked) => save({ id: product.id, isAvailable: checked })}
        />
      </TableCell>
    </TableRow>
  );
}
