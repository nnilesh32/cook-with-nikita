import "server-only";

/**
 * OTP stub — there's no SMS gateway wired up, so this simulates one:
 * generates a real 4-digit code, holds it in memory for 5 minutes, and
 * (outside production) hands the code straight back to the caller so
 * the checkout flow can display it, since there's no other channel to
 * deliver it through. Swap for a real SMS provider before launch.
 */

type Entry = { code: string; expiresAt: number; attempts: number };

const otps = new Map<string, Entry>();

const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export function generateOtp(phone: string): { code: string; isDev: boolean } {
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  otps.set(phone, { code, expiresAt: Date.now() + OTP_TTL_MS, attempts: 0 });
  return { code, isDev: process.env.NODE_ENV !== "production" };
}

export function verifyOtp(phone: string, code: string): { success: boolean; reason?: string } {
  const entry = otps.get(phone);
  if (!entry) return { success: false, reason: "Request a code first." };
  if (Date.now() > entry.expiresAt) {
    otps.delete(phone);
    return { success: false, reason: "That code expired — send a new one." };
  }
  if (entry.attempts >= MAX_ATTEMPTS) {
    otps.delete(phone);
    return { success: false, reason: "Too many attempts — send a new code." };
  }
  entry.attempts += 1;
  if (entry.code !== code) {
    return { success: false, reason: "That code doesn't match." };
  }
  otps.delete(phone);
  markPhoneVerified(phone);
  return { success: true };
}

/**
 * A one-time OTP code is consumed the moment it's checked, so it can't
 * be re-sent to order-creation as proof of verification — that action
 * needs to run its own server-side check, potentially well after (and
 * separately from) the client's verify call. This short-lived flag is
 * that proof: set once on a successful verifyOtp(), read (not consumed)
 * by createOrderAction/bookClassAction so phone verification can't be
 * skipped by calling those actions directly.
 */
const verifiedPhones = new Map<string, number>(); // phone -> expiresAt
const VERIFIED_TTL_MS = 15 * 60 * 1000;

function markPhoneVerified(phone: string) {
  verifiedPhones.set(phone, Date.now() + VERIFIED_TTL_MS);
}

export function isPhoneVerified(phone: string): boolean {
  const expiresAt = verifiedPhones.get(phone);
  if (!expiresAt) return false;
  if (Date.now() > expiresAt) {
    verifiedPhones.delete(phone);
    return false;
  }
  return true;
}
