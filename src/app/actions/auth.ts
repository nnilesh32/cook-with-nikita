"use server";

import { z } from "zod";

import { auth, signIn, signOut } from "@/lib/auth";
import { generateOtp } from "@/lib/otp";
import { rateLimit } from "@/lib/rate-limit";

const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit phone number");

export async function requestAccountOtpAction(phone: string) {
  const parsed = phoneSchema.safeParse(phone);
  if (!parsed.success) return { success: false as const, error: parsed.error.issues[0].message };

  if (!rateLimit(`account-otp:${phone}`, 3, 10 * 60 * 1000)) {
    return { success: false as const, error: "Too many codes requested — wait a few minutes and try again." };
  }

  const { code, isDev } = generateOtp(phone);
  return { success: true as const, devCode: isDev ? code : undefined };
}

export async function loginWithOtpAction(phone: string, otp: string) {
  try {
    await signIn("credentials", { phone, otp, redirect: false });
    return { success: true as const };
  } catch {
    return { success: false as const, error: "That code didn't work — check it and try again." };
  }
}

export async function signOutAction() {
  await signOut({ redirect: false });
}

export async function currentCustomerId() {
  const session = await auth();
  return session?.user?.id ?? null;
}
