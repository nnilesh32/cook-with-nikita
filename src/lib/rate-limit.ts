import "server-only";

/**
 * In-memory rate limiting — a single Next.js dev/demo server, not a
 * multi-instance production deployment, so a plain Map is enough. Swap
 * for Redis/Upstash if this ever runs behind more than one instance.
 */
const buckets = new Map<string, number[]>();

/** Returns true if `key` is still within its limit (and records this
 * attempt); false if it should be rejected. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const attempts = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

  if (attempts.length >= limit) {
    buckets.set(key, attempts);
    return false;
  }

  attempts.push(now);
  buckets.set(key, attempts);
  return true;
}

/** Every distinct key (phone number, IP, …) this has ever seen gets its
 * own Map entry that nothing removes on its own — a slow leak over a
 * long-running process's lifetime. Sweeping out fully-expired buckets
 * periodically bounds that growth without needing a real store. Call
 * this from one long-lived place (e.g. an interval set up once at
 * module scope where the process itself lives) rather than per-request. */
export function pruneExpiredBuckets(maxWindowMs: number) {
  const now = Date.now();
  for (const [key, attempts] of buckets) {
    const stillLive = attempts.some((t) => now - t < maxWindowMs);
    if (!stillLive) buckets.delete(key);
  }
}

// This module is only evaluated once per Node process (module caching),
// so scheduling the sweep here — rather than expecting every call site
// to remember to — is enough. The longest window any caller in this
// codebase actually uses is createOrderAction's 1-hour order limit, so
// a generous 24h retention comfortably covers all of them.
if (typeof setInterval !== "undefined") {
  const interval = setInterval(() => pruneExpiredBuckets(24 * 60 * 60 * 1000), 60 * 60 * 1000);
  interval.unref?.();
}
