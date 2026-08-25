import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * A single shared password gates /admin — there's one cook, one admin.
 * No separate user model, no NextAuth provider; just a cookie whose
 * value is an HMAC over a fixed label, keyed by AUTH_SECRET, so it can't
 * be forged without knowing that secret and doesn't need server-side
 * session storage.
 */
const COOKIE_NAME = "cwn_admin";
const DEFAULT_PASSWORD = "nikita-admin";
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

let warnedAboutDefaults = false;

/** ADMIN_PASSWORD/AUTH_SECRET are allowed to be unset for local dev and
 * demos — that's the whole point of the "zero secrets" setup — but
 * shipping that default to a real, publicly-reachable deployment means
 * anyone who's read this file (or a leaked copy of it) has admin
 * access. Warn loudly rather than silently accepting it once the app
 * thinks it's actually in production. */
function warnIfUnsafeDefaults() {
  if (warnedAboutDefaults || process.env.NODE_ENV !== "production") return;
  if (!process.env.ADMIN_PASSWORD || !process.env.AUTH_SECRET) {
    warnedAboutDefaults = true;
    console.error(
      "[admin-auth] Running in production without ADMIN_PASSWORD and/or AUTH_SECRET set — " +
        "/admin is reachable with the default password. Set both before this goes live."
    );
  }
}

function secret() {
  warnIfUnsafeDefaults();
  return process.env.AUTH_SECRET || "dev-only-insecure-secret";
}

function adminPassword() {
  warnIfUnsafeDefaults();
  return process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
}

function expectedToken() {
  return createHmac("sha256", secret()).update("cwn-admin-session").digest("hex");
}

export function checkAdminPassword(password: string): boolean {
  // Constant-time compare — plain `===` short-circuits on the first
  // mismatched character, which leaks timing information about how
  // many leading characters of a guess are correct. HMAC-ing both sides
  // first also sidesteps the length check timingSafeEqual itself would
  // otherwise need (it requires equal-length buffers).
  const expected = createHmac("sha256", secret()).update(adminPassword()).digest();
  const actual = createHmac("sha256", secret()).update(password).digest();
  return timingSafeEqual(expected, actual);
}

export async function setAdminSession() {
  const store = await cookies();
  store.set(COOKIE_NAME, expectedToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/admin",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const value = store.get(COOKIE_NAME)?.value;
  if (!value) return false;

  const expected = expectedToken();
  const a = Buffer.from(value);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
