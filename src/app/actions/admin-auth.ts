"use server";

import { headers } from "next/headers";

import { checkAdminPassword, clearAdminSession, setAdminSession } from "@/lib/admin-auth";
import { rateLimit } from "@/lib/rate-limit";

/** Best-effort client IP from whatever the hosting platform's proxy set
 * (Vercel and most others set x-forwarded-for; nothing's set in local
 * dev, where "unknown" is fine since there's only one caller anyway). */
async function clientIp() {
  const store = await headers();
  const forwarded = store.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return store.get("x-real-ip") ?? "unknown";
}

export async function adminLoginAction(password: string) {
  // Keyed per-IP, not one shared bucket — a shared key means anyone
  // failing 10 guesses locks out the real admin's own next attempt too,
  // an unauthenticated denial-of-service on the whole dashboard.
  const ip = await clientIp();
  if (!rateLimit(`admin-login:${ip}`, 10, 10 * 60 * 1000)) {
    return { success: false as const, error: "Too many attempts — wait a few minutes and try again." };
  }
  if (!checkAdminPassword(password)) {
    return { success: false as const, error: "Wrong password." };
  }
  await setAdminSession();
  return { success: true as const };
}

export async function adminLogoutAction() {
  await clearAdminSession();
}
