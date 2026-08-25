"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { loginWithOtpAction, requestAccountOtpAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const phoneValid = /^[6-9]\d{9}$/.test(phone);

  function handleSendOtp() {
    setError(null);
    startTransition(async () => {
      const result = await requestAccountOtpAction(phone);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setOtpSent(true);
      setOtp("");
      toast.success(
        result.devCode ? `No SMS gateway hooked up yet — your code is ${result.devCode}` : "Code sent to your phone."
      );
    });
  }

  function handleVerify() {
    setError(null);
    startTransition(async () => {
      const result = await loginWithOtpAction(phone, otp);
      if (!result.success) {
        setError(result.error);
        return;
      }
      toast.success("Signed in.");
      router.refresh();
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-5 rounded-2xl border border-steel/50 bg-card p-6 sm:p-8">
      <div>
        <h1 className="font-display text-2xl font-medium text-ink">Sign in</h1>
        <p className="mt-1 text-sm text-ink/60">
          Same number you order on — I&apos;ll text you a code, no password to remember.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="account-phone">Phone number</Label>
        <div className="flex gap-2">
          <Input
            id="account-phone"
            inputMode="numeric"
            maxLength={10}
            value={phone}
            disabled={otpSent}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            placeholder="10-digit mobile number"
          />
          <Button type="button" variant="outline" onClick={handleSendOtp} disabled={!phoneValid || otpSent || pending}>
            {otpSent ? "Resend" : "Send code"}
          </Button>
        </div>
      </div>

      {otpSent && (
        <div className="flex items-end gap-2 rounded-lg border border-steel/50 bg-background p-3">
          <div className="flex-1">
            <Label htmlFor="account-otp">4-digit code</Label>
            <Input
              id="account-otp"
              inputMode="numeric"
              maxLength={4}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="mt-1.5"
            />
          </div>
          <Button type="button" onClick={handleVerify} disabled={otp.length !== 4 || pending}>
            Verify &amp; sign in
          </Button>
        </div>
      )}

      {error && <p className="text-xs text-kashmiri">{error}</p>}

      <p className="text-xs text-ink/50">
        New here? Signing in creates your account automatically — no separate sign-up.
      </p>
    </div>
  );
}
