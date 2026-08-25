"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

import { checkPincodeAction, sendOtpAction, verifyOtpAction } from "@/app/actions/checkout";
import type { CheckoutValues } from "@/components/checkout/checkout-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type PincodeStatus = { serviceable: true; area: string } | { serviceable: false; reason: string };

export function StepDetails({ form }: { form: UseFormReturn<CheckoutValues> }) {
  const fulfilment = form.watch("fulfilment");
  const phone = form.watch("phone");
  const otpVerified = form.watch("otpVerified");
  const pincode = form.watch("pincode");

  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpPending, startOtpTransition] = useTransition();

  const [pincodeStatus, setPincodeStatus] = useState<PincodeStatus | null>(null);
  const [pincodePending, startPincodeTransition] = useTransition();

  const verifiedPhone = useRef<string | null>(null);
  useEffect(() => {
    if (otpVerified && verifiedPhone.current && verifiedPhone.current !== phone) {
      form.setValue("otpVerified", false);
      setOtpSent(false);
      setOtpCode("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone]);

  const phoneValid = /^[6-9]\d{9}$/.test(phone ?? "");

  function handleSendOtp() {
    setOtpError(null);
    startOtpTransition(async () => {
      const result = await sendOtpAction(phone);
      if (!result.success) {
        setOtpError(result.error);
        return;
      }
      setOtpSent(true);
      setOtpCode("");
      toast.success(
        result.devCode
          ? `No SMS gateway hooked up yet — your code is ${result.devCode}`
          : "Code sent to your phone."
      );
    });
  }

  function handleVerifyOtp() {
    setOtpError(null);
    startOtpTransition(async () => {
      const result = await verifyOtpAction(phone, otpCode);
      if (!result.success) {
        setOtpError(result.reason ?? "That code didn't work.");
        return;
      }
      verifiedPhone.current = phone;
      form.setValue("otpVerified", true, { shouldValidate: true });
      toast.success("Phone verified.");
    });
  }

  function handlePincodeBlur() {
    if (!pincode || !/^\d{6}$/.test(pincode)) {
      setPincodeStatus(null);
      return;
    }
    startPincodeTransition(async () => {
      const result = await checkPincodeAction(pincode);
      setPincodeStatus(result);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Your name</Label>
          <Input id="name" {...form.register("name")} placeholder="Full name" />
          {form.formState.errors.name && (
            <p className="text-xs text-kashmiri">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Phone number</Label>
          <div className="flex gap-2">
            <Input
              id="phone"
              inputMode="numeric"
              maxLength={10}
              disabled={otpVerified}
              {...form.register("phone")}
              placeholder="10-digit mobile number"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleSendOtp}
              disabled={!phoneValid || otpVerified || otpPending}
            >
              {otpVerified ? "Verified" : otpSent ? "Resend" : "Send code"}
            </Button>
          </div>
          {form.formState.errors.phone && (
            <p className="text-xs text-kashmiri">{form.formState.errors.phone.message}</p>
          )}
        </div>
      </div>

      {otpSent && !otpVerified && (
        <div className="flex items-end gap-2 rounded-lg border border-steel/50 bg-card p-3">
          <div className="flex-1">
            <Label htmlFor="otp">4-digit code</Label>
            <Input
              id="otp"
              inputMode="numeric"
              maxLength={4}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              className="mt-1.5"
            />
          </div>
          <Button type="button" onClick={handleVerifyOtp} disabled={otpCode.length !== 4 || otpPending}>
            Verify
          </Button>
        </div>
      )}
      {otpError && <p className="text-xs text-kashmiri">{otpError}</p>}
      {!otpSent && form.formState.errors.otpVerified && (
        <p className="-mt-3 text-xs text-kashmiri">{form.formState.errors.otpVerified.message}</p>
      )}

      {fulfilment === "DELIVERY" && (
        <div className="flex flex-col gap-4 border-t border-steel/40 pt-6">
          <p className="text-sm font-medium text-ink">Delivery address</p>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="line1">Address</Label>
            <Input id="line1" {...form.register("line1")} placeholder="Flat / house no., building, street" />
            {form.formState.errors.line1 && (
              <p className="text-xs text-kashmiri">{form.formState.errors.line1.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="line2">Landmark (optional)</Label>
            <Input id="line2" {...form.register("line2")} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="city">City</Label>
              <Input id="city" {...form.register("city")} />
              {form.formState.errors.city && (
                <p className="text-xs text-kashmiri">{form.formState.errors.city.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                inputMode="numeric"
                maxLength={6}
                {...form.register("pincode")}
                onBlur={(e) => {
                  form.register("pincode").onBlur(e);
                  handlePincodeBlur();
                }}
              />
              {form.formState.errors.pincode && (
                <p className="text-xs text-kashmiri">{form.formState.errors.pincode.message}</p>
              )}
              {pincodePending && <p className="text-xs text-ink/50">Checking…</p>}
              {!pincodePending && pincodeStatus && (
                <p className={`text-xs ${pincodeStatus.serviceable ? "text-coriander" : "text-kashmiri"}`}>
                  {pincodeStatus.serviceable ? `Delivers to ${pincodeStatus.area}.` : pincodeStatus.reason}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="deliveryNotes">Delivery notes (optional)</Label>
            <Textarea
              id="deliveryNotes"
              {...form.register("deliveryNotes")}
              rows={2}
              maxLength={300}
              placeholder="Gate code, landmark, anything the delivery person should know…"
              className="resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
