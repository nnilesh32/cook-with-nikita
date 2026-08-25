# Cook with Nikita

A production-quality marketing + e-commerce site for a home-kitchen food
brand: delivery/pickup ordering, cooking classes, catering enquiries, a
pantry shop, and a password-gated admin dashboard — all running against
real (seeded) data, with zero required secrets.

```
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The first `npm run dev`
(or `npm run build`) runs migrations and seeds the database automatically —
see [Getting started](#getting-started) below.

## Tech stack

- **Next.js 15** (App Router, TypeScript strict, Server Components/Actions)
- **Tailwind CSS v4** + [shadcn/ui](https://ui.shadcn.com) on
  [Base UI](https://base-ui.com) primitives
- **Prisma 6** + SQLite for local dev (Postgres-ready — see below)
- **Zustand** (persisted cart), **React Hook Form + Zod** (forms)
- **NextAuth v5** — phone + OTP-stub credentials provider
- **next-mdx-remote** — MDX-backed recipes (`content/recipes/*.mdx`)
- A small **payment provider abstraction** (`src/lib/payments/`) — `MockProvider`
  by default, `RazorpayProvider` when real test keys are present

## Getting started

```bash
npm install
cp .env.example .env   # optional — the app runs with zero secrets set
npm run dev
```

`npm run dev` (and `npm run build`) run a `predev`/`prebuild` step that
applies Prisma migrations and seeds the database **only if it's empty**
(`tsx prisma/seed.ts --if-empty`) — safe to run repeatedly, won't wipe
data you've created through the app or admin dashboard.

To force a full reseed from scratch:

```bash
npm run db:reset
```

### Signing in

- **Customer account / checkout OTP** — there's no real SMS gateway
  (`src/lib/otp.ts`). Requesting a code shows it directly in a toast
  (`"No SMS gateway hooked up yet — your code is 1234"`).
- **Admin dashboard** (`/admin`) — password gate, defaults to
  `nikita-admin` in dev. Set `ADMIN_PASSWORD` before deploying.

### Environment variables

All optional for local dev — see `.env.example` for the full list with
explanations. Nothing needs to be set to run the app end to end.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | SQLite file path (Postgres connection string in prod) |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for the sitemap, JSON-LD, OG URLs |
| `AUTH_SECRET` | NextAuth session signing key (also used to key the admin cookie) |
| `ADMIN_PASSWORD` | `/admin` password — defaults to `nikita-admin` if unset |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Leave unset to keep using `MockProvider` |

## Project structure

```
prisma/
  schema.prisma       17 models — catalogue, orders, classes, bookings, coupons, enquiries…
  seed.ts             All demo data: 28 dishes, 6 classes, 5 coupons, 20 orders, reviews
content/
  recipes/*.mdx        5 recipes, structured ingredients + MDX method
src/
  app/                 Route segments — one folder per URL, admin under app/admin/(dashboard)
  components/          UI split by domain (menu/, cart/, checkout/, classes/, admin/, ui/…)
  lib/                 Business logic — pricing, serviceability, kitchen hours, payments…
  lib/data/            Server-only data-fetching, one file per domain
  app/actions/         Server actions (mutations), one file per domain
  stores/              Zustand cart store
```

## Key architectural notes

**Payment provider abstraction** (`src/lib/payments/`) — a single
`PaymentProvider` interface with `charge()`/`verify()`. `MockProvider`
always succeeds after a 1.5s delay; `RazorpayProvider` does the real
Razorpay Orders API + HMAC signature verification, transparently falling
back to `MockProvider` whenever `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET`
aren't set. **This has never been run against a live Razorpay account in
this build** — treat it as a correct, unexercised implementation. See
[Going live with Razorpay](#going-live-with-razorpay) before trusting it
with real money.

**Server-side price revalidation** — the client cart is never trusted.
`validateCart()` (`src/lib/data/checkout.ts`) re-fetches authoritative
prices, availability and daily-limit counts from the database before
every order is created; a stale or tampered client price is rejected,
not silently accepted.

**Kitchen scheduling** — a single set of constants in `src/lib/kitchen.ts`
(open days, hours, order cutoff) drives lead-time labels on the menu, the
checkout date/slot picker, and slot capacity checks. Change it in one
place.

**Admin auth** — no separate user model; `/admin` is gated by a single
shared password (`ADMIN_PASSWORD`), enforced via a stateless HMAC cookie
(`src/lib/admin-auth.ts`) rather than server-side session storage.

**Recipes** are MDX files in `content/recipes/`, not database rows —
frontmatter carries structured ingredients (so the servings scaler can
do real math) and cross-sell product slugs; the body is prose + method
steps rendered through `next-mdx-remote/rsc`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Migrate + seed (if empty) + start the dev server |
| `npm run build` | Migrate + production build |
| `npm run start` | Start the production server (after `build`) |
| `npm run lint` | ESLint |
| `npm run db:seed` | Reseed (adds to whatever's already there) |
| `npm run db:reset` | Drop, recreate, and reseed the database |

## Moving to Postgres

SQLite is fine for local dev and demos; for production, swap the
datasource:

1. In `prisma/schema.prisma`, change `provider = "sqlite"` to
   `provider = "postgresql"` under `datasource db`.
2. Point `DATABASE_URL` at a real Postgres connection string.
3. Run `npx prisma migrate dev` to generate a fresh migration against
   Postgres (SQLite and Postgres migrations aren't interchangeable —
   you're starting a new migration history, not replaying the SQLite
   ones).
4. Nothing else in the codebase changes — all queries go through
   Prisma's generated client, which is provider-agnostic.

## Going live with Razorpay

1. Get test (then live) API keys from the Razorpay dashboard.
2. Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (server-only) and
   `NEXT_PUBLIC_RAZORPAY_KEY_ID` (same key id, exposed to the client for
   the Checkout modal).
3. That's it — `getPaymentProvider()` (`src/lib/payments/index.ts`)
   automatically returns `RazorpayProvider` once both server-side keys
   are present; no code changes needed.
4. **Test the full flow before going live**: place a real order in
   Razorpay test mode, confirm the webhook-free client-side verification
   in `confirmRazorpayPaymentAction` actually marks the order paid. This
   path has not been exercised against a live account in this build.

## Before launch — real business data

Every placeholder fact, photo, and policy string is tracked in
[`CONTENT.md`](./CONTENT.md) — the punch list for replacing seed/demo
data with Nikita's actual menu, photos, delivery zones, and contact
details.

## Testing notes

There's no automated test suite — this was built and verified through
`npx tsc --noEmit` + `npx eslint .` at every step, full `npm run build`
production checks, and extensive live browser testing of every flow
(ordering, checkout with server-side price revalidation, class booking +
payment, admin order management, coupon creation, enquiry handling).
Two infrastructure bugs were caught this way during development — a
Prisma SQLite path-resolution issue under Turbopack, and a UTC/IST
timezone bug in "today" date calculation — both fixed and documented
inline where they occurred.
