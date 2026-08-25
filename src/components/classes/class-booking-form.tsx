"use client";

import { Minus, Plus } from "lucide-react";
import { useState, useTransition } from "react";

import { bookClassAction, confirmRazorpayBookingAction } from "@/app/actions/classes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatINR } from "@/lib/currency";
import type { RazorpayCheckoutConfig } from "@/lib/payments";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

let scriptPromise: Promise<void> | null = null;
function loadRazorpayScript() {
  scriptPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Couldn't load the payment script."));
    document.body.appendChild(script);
  });
  return scriptPromise;
}

export function ClassBookingForm({
  classSessionId,
  price,
  seatsRemaining,
}: {
  classSessionId: string;
  price: number;
  seatsRemaining: number;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [seats, setSeats] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const [payingLive, setPayingLive] = useState(false);

  const maxSeats = Math.min(6, seatsRemaining);
  const phoneValid = /^[6-9]\d{9}$/.test(phone);
  const canSubmit = name.trim().length >= 2 && phoneValid && seats >= 1 && seats <= maxSeats;

  function openRazorpay(checkout: RazorpayCheckoutConfig, bookingId: string) {
    setPayingLive(true);
    loadRazorpayScript()
      .then(() => {
        const razorpay = new window.Razorpay({
          key: checkout.keyId,
          amount: checkout.amount,
          currency: checkout.currency,
          name: checkout.name,
          description: checkout.description,
          order_id: checkout.razorpayOrderId,
          prefill: checkout.prefill,
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            const result = await confirmRazorpayBookingAction({
              bookingId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            if (result.success) {
              setConfirmed(result.bookingId);
            } else {
              setError(result.error);
            }
            setPayingLive(false);
          },
          modal: { ondismiss: () => setPayingLive(false) },
        });
        razorpay.open();
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Couldn't open the payment window.");
        setPayingLive(false);
      });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await bookClassAction({ classSessionId, name, phone, email: email || undefined, seats });
      if (!result.success) {
        setError(result.error);
        return;
      }
      if (result.checkout) {
        openRazorpay(result.checkout, result.bookingId);
        return;
      }
      setConfirmed(result.bookingId);
    });
  }

  if (confirmed) {
    return (
      <div className="rounded-2xl border border-coriander/40 bg-coriander/5 p-6">
        <p className="text-lg font-medium text-ink">You&apos;re in.</p>
        <p className="mt-1 text-sm text-ink/65">
          {seats} seat{seats > 1 ? "s" : ""} confirmed for {name.split(" ")[0]}. I&apos;ll message you on WhatsApp
          before the class with anything you need to bring.
        </p>
      </div>
    );
  }

  if (seatsRemaining <= 0) {
    return (
      <div className="rounded-2xl border border-steel/50 bg-card p-6 text-center">
        <p className="font-medium text-ink">This class is fully booked.</p>
        <p className="mt-1 text-sm text-ink/60">Check the other upcoming classes, or message me to join a waitlist.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-steel/50 bg-card p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink">Reserve your seat</p>
        <p className="font-mono text-sm text-ink">{formatINR(price)} / seat</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="class-name">Your name</Label>
        <Input id="class-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="class-phone">Phone number</Label>
        <Input
          id="class-phone"
          inputMode="numeric"
          maxLength={10}
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
          placeholder="10-digit mobile number"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="class-email">Email (optional)</Label>
        <Input id="class-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Seats</Label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Fewer seats"
            onClick={() => setSeats((s) => Math.max(1, s - 1))}
            className="flex size-8 items-center justify-center rounded-full border border-steel/60 text-ink hover:bg-muted"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-6 text-center font-mono text-sm text-ink">{seats}</span>
          <button
            type="button"
            aria-label="More seats"
            onClick={() => setSeats((s) => Math.min(maxSeats, s + 1))}
            className="flex size-8 items-center justify-center rounded-full border border-steel/60 text-ink hover:bg-muted"
          >
            <Plus className="size-4" />
          </button>
          <span className="text-xs text-ink/50">{seatsRemaining} left</span>
        </div>
      </div>

      {error && <p className="text-xs text-kashmiri">{error}</p>}

      <Button type="submit" size="lg" disabled={!canSubmit || pending || payingLive}>
        {pending || payingLive ? "Booking…" : `Book & pay ${formatINR(price * seats)}`}
      </Button>
    </form>
  );
}
