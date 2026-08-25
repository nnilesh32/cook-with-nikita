"use client";

import { useState, useTransition } from "react";

import { submitEnquiryAction } from "@/app/actions/enquiries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const CUISINE_OPTIONS = ["North Indian", "South Indian", "Mixed regional", "Sweets-only", "Not sure yet"];
const BUDGET_OPTIONS = ["Under ₹50,000", "₹50,000 – ₹1,00,000", "₹1,00,000 – ₹2,50,000", "₹2,50,000+"];

export function EnquiryForm({ type }: { type: "CATERING" | "CONTACT" }) {
  const isCatering = type === "CATERING";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [budgetBand, setBudgetBand] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  const phoneValid = /^[6-9]\d{9}$/.test(phone);
  const canSubmit = name.trim().length >= 2 && phoneValid && message.trim().length >= 10;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await submitEnquiryAction({
        type,
        name,
        phone,
        email: email || undefined,
        message,
        guestCount: guestCount ? Number(guestCount) : undefined,
        eventDate: eventDate || undefined,
        cuisine: isCatering ? cuisine || undefined : undefined,
        budgetBand: isCatering ? budgetBand || undefined : undefined,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSent(true);
    });
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-coriander/40 bg-coriander/5 p-6">
        <p className="text-lg font-medium text-ink">Got it, thank you.</p>
        <p className="mt-1 text-sm text-ink/65">
          I read these myself and usually reply within a day. If it&apos;s urgent, message the kitchen on WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-steel/50 bg-card p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="enq-name">Your name</Label>
          <Input id="enq-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="enq-phone">Phone number</Label>
          <Input
            id="enq-phone"
            inputMode="numeric"
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            placeholder="10-digit mobile number"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="enq-email">Email (optional)</Label>
        <Input id="enq-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      {isCatering && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="enq-guests">Guest count</Label>
            <Input
              id="enq-guests"
              inputMode="numeric"
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value.replace(/\D/g, ""))}
              placeholder="e.g. 50"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="enq-date">Event date</Label>
            <Input id="enq-date" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="enq-budget">Budget</Label>
            <Select value={budgetBand} onValueChange={(value) => setBudgetBand(value ?? "")}>
              <SelectTrigger id="enq-budget">
                <SelectValue placeholder="Pick a range" />
              </SelectTrigger>
              <SelectContent>
                {BUDGET_OPTIONS.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {isCatering && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="enq-cuisine">Cuisine focus</Label>
          <Select value={cuisine} onValueChange={(value) => setCuisine(value ?? "")}>
            <SelectTrigger id="enq-cuisine">
              <SelectValue placeholder="Pick one" />
            </SelectTrigger>
            <SelectContent>
              {CUISINE_OPTIONS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="enq-message">{isCatering ? "Tell me about the event" : "Message"}</Label>
        <Textarea
          id="enq-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder={
            isCatering
              ? "Occasion, venue, any dietary needs, roughly how many people…"
              : "What can I help with?"
          }
        />
      </div>

      {error && <p className="text-xs text-kashmiri">{error}</p>}

      <Button type="submit" size="lg" disabled={!canSubmit || pending}>
        {pending ? "Sending…" : "Send enquiry"}
      </Button>
    </form>
  );
}
