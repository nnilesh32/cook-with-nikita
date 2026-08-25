"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { createCouponAction, toggleCouponAction } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { getCouponsForAdmin } from "@/lib/data/admin";

type Coupon = Awaited<ReturnType<typeof getCouponsForAdmin>>[number];

function valueLabel(coupon: Coupon) {
  if (coupon.type === "PERCENTAGE") return `${coupon.value}% off`;
  if (coupon.type === "FLAT") return `₹${coupon.value} off`;
  return "Free delivery";
}

export function CouponsManager({ coupons }: { coupons: Coupon[] }) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <CreateCouponDialog onCreated={() => router.refresh()} />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead>Min order</TableHead>
            <TableHead>Uses</TableHead>
            <TableHead>Active</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coupons.map((coupon) => (
            <CouponRow key={coupon.id} coupon={coupon} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function CouponRow({ coupon }: { coupon: Coupon }) {
  const [pending, startTransition] = useTransition();

  return (
    <TableRow className={pending ? "opacity-60" : undefined}>
      <TableCell className="font-mono text-xs text-ink">{coupon.code}</TableCell>
      <TableCell className="text-ink/70">{valueLabel(coupon)}</TableCell>
      <TableCell className="text-ink/70">{coupon.minOrderValue ? `₹${coupon.minOrderValue}` : "—"}</TableCell>
      <TableCell className="text-ink/70">
        {coupon.usedCount}
        {coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
      </TableCell>
      <TableCell>
        <Switch
          checked={coupon.isActive}
          onCheckedChange={(checked) =>
            startTransition(async () => {
              await toggleCouponAction(coupon.id, checked);
              toast.success(`${coupon.code} ${checked ? "activated" : "deactivated"}.`);
            })
          }
        />
      </TableCell>
    </TableRow>
  );
}

function CreateCouponDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"PERCENTAGE" | "FLAT" | "FREE_DELIVERY">("PERCENTAGE");
  const [value, setValue] = useState("10");
  const [minOrderValue, setMinOrderValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createCouponAction({
        code,
        type,
        value: type === "FREE_DELIVERY" ? 0 : Number(value),
        minOrderValue: minOrderValue ? Number(minOrderValue) : undefined,
        firstOrderOnly: false,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      toast.success(`${code.toUpperCase()} created.`);
      setOpen(false);
      setCode("");
      onCreated();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>New coupon</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New coupon</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="coupon-code">Code</Label>
            <Input
              id="coupon-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. WELCOME10"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => v && setType(v as typeof type)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PERCENTAGE">Percentage off</SelectItem>
                <SelectItem value="FLAT">Flat amount off</SelectItem>
                <SelectItem value="FREE_DELIVERY">Free delivery</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {type !== "FREE_DELIVERY" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="coupon-value">{type === "PERCENTAGE" ? "Percent off" : "Amount off (₹)"}</Label>
              <Input id="coupon-value" type="number" value={value} onChange={(e) => setValue(e.target.value)} />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="coupon-min">Minimum order value (optional)</Label>
            <Input
              id="coupon-min"
              type="number"
              value={minOrderValue}
              onChange={(e) => setMinOrderValue(e.target.value)}
            />
          </div>
          {error && <p className="text-xs text-kashmiri">{error}</p>}
          <Button type="submit" disabled={!code || pending}>
            {pending ? "Creating…" : "Create coupon"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
