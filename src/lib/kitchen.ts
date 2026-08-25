/**
 * Kitchen-wide scheduling constants. A single cutoff hour, applied
 * consistently everywhere lead-time copy shows up — the menu grid today,
 * the checkout date picker in phase 4.
 */

export const ORDER_CUTOFF_HOUR = 20; // 8pm

/** Closed Mondays — everything else open 11am–9pm. Weekday numbering
 * matches `Date.getDay()`: 0 Sun, 1 Mon, 2 Tue … 6 Sat. */
export const CLOSED_WEEKDAYS = [1];
export const KITCHEN_OPEN_HOUR = 11;
export const KITCHEN_CLOSE_HOUR = 21;

/**
 * The kitchen is in Mumbai — every "today"/"past 8pm cutoff" calculation
 * in this file means *IST's* today, not whatever timezone the Node
 * process happens to be running in. Reading local getters
 * (`date.getHours()`, `date.getDate()`, …) is only correct on a host
 * whose TZ is already set to Asia/Kolkata; most cloud/serverless
 * defaults run UTC, which silently shifts these by 5.5 hours — the
 * exact class of bug `toISOString()` caused before (see todayIso below).
 * Going through Intl with an explicit timeZone sidesteps the host's
 * clock setting entirely.
 */
const IST_TIME_ZONE = "Asia/Kolkata";
const IST_WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function istParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: IST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23", // not hour12:false — some engines give "24" not "00" for midnight otherwise
    weekday: "short",
  }).formatToParts(date);

  const byType = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return {
    year: Number(byType.year),
    month: Number(byType.month),
    day: Number(byType.day),
    hour: Number(byType.hour),
    weekday: IST_WEEKDAY_INDEX[byType.weekday],
  };
}

export function isWeeklyOpenDay(date: Date): boolean {
  return !CLOSED_WEEKDAYS.includes(istParts(date).weekday);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Short, card-sized copy for a product's lead time. */
export function leadTimeLabel(leadTimeHours: number, now: Date = new Date()): string {
  if (leadTimeHours >= 24) {
    return "Needs a day's notice";
  }
  return isPastCutoff(now) ? "Order by 8pm for tomorrow" : "Order by 8pm today";
}

export function isPastCutoff(now: Date = new Date()): boolean {
  return istParts(now).hour >= ORDER_CUTOFF_HOUR;
}

/** "YYYY-MM-DD" for IST's calendar day — deliberately not
 * `toISOString()`, which converts to UTC first and silently rolls the
 * date back a day for anyone/anything east of UTC (all of India, every
 * night after ~5:30pm UTC). The kitchen's "today" is IST's today,
 * regardless of what timezone the server process itself is running in. */
export function todayIso(now: Date = new Date()): string {
  const { year, month, day } = istParts(now);
  return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}
