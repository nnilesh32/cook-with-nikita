"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { updateTimeSlotAction } from "@/app/actions/admin";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { getTimeSlotsForAdmin } from "@/lib/data/admin";

type TimeSlot = Awaited<ReturnType<typeof getTimeSlotsForAdmin>>[number];

export function SlotsManager({ slots }: { slots: TimeSlot[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Slot</TableHead>
          <TableHead>Fulfilment</TableHead>
          <TableHead>Capacity</TableHead>
          <TableHead>Active</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {slots.map((slot) => (
          <SlotRow key={slot.id} slot={slot} />
        ))}
      </TableBody>
    </Table>
  );
}

function SlotRow({ slot }: { slot: TimeSlot }) {
  const [pending, startTransition] = useTransition();

  function save(fields: Parameters<typeof updateTimeSlotAction>[0]) {
    startTransition(async () => {
      const result = await updateTimeSlotAction(fields);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(`${slot.label} updated.`);
    });
  }

  return (
    <TableRow className={pending ? "opacity-60" : undefined}>
      <TableCell className="font-medium text-ink">{slot.label}</TableCell>
      <TableCell className="text-ink/60">{slot.fulfilment ?? "Both"}</TableCell>
      <TableCell>
        <Input
          type="number"
          defaultValue={slot.capacity}
          className="h-8 w-20"
          onBlur={(e) => {
            const value = Number(e.target.value);
            if (Number.isFinite(value) && value !== slot.capacity) {
              save({ id: slot.id, capacity: value });
            }
          }}
        />
      </TableCell>
      <TableCell>
        <Switch checked={slot.isActive} onCheckedChange={(checked) => save({ id: slot.id, isActive: checked })} />
      </TableCell>
    </TableRow>
  );
}
