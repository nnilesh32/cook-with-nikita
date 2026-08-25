# Content checklist — before you launch

Every placeholder fact, photo, and policy string in the codebase, in one
list. The app is feature-complete; everything below is real, working
data — it's just not *Nikita's* data yet. Search the file path for the
exact string to replace it.

## Business facts (placeholders — replace with the real ones)

| Fact | Where | Current placeholder |
|---|---|---|
| WhatsApp number | `src/lib/site.ts` (footer, contact page, order confirmation, tracking) | `+91 98765 43210` (`wa.me/919876543210`) |
| Delivery zones & fees | `src/lib/serviceability.ts` | 8 Mumbai western-suburb pincodes, ₹0–70 by zone |
| Kitchen area / address | `src/lib/serviceability.ts` (`KITCHEN_AREA`) — used on `/contact`'s map embed, JSON-LD, confirmation page | "Andheri West, Mumbai" |
| Kitchen hours | `src/lib/kitchen.ts` (`KITCHEN_OPEN_HOUR`/`KITCHEN_CLOSE_HOUR`/`CLOSED_WEEKDAYS`), mirrored in footer, `/contact`, `/faq`, JSON-LD | Tue–Sun, 11am–9pm |
| Order cutoff hour | `src/lib/kitchen.ts` (`ORDER_CUTOFF_HOUR`) | 8pm |
| Minimum order value / packaging fee / GST rate | `src/lib/serviceability.ts` | ₹500 minimum, ₹20 packaging, 5% GST |
| FSSAI licence number | `src/components/layout/site-footer.tsx` | "FSSAI-licensed home kitchen" (no number shown — add once you have it) |
| Admin password | `.env` → `ADMIN_PASSWORD` | Defaults to `nikita-admin` if unset — **change before deploying** |
| Site URL | `.env` → `NEXT_PUBLIC_SITE_URL` | Falls back to `http://localhost:3000` — set for real sitemap/JSON-LD URLs |

## Menu, classes, coupons — all placeholder data

`prisma/seed.ts` is the single source for all of it: 28 dishes (names,
descriptions, prices, portions, add-ons, daily limits), 7 categories, 6
classes (dates relative to today), 5 coupon codes, and 12 reviews. Before
launch:

- Rewrite the `PRODUCT_DEFS` / `CLASS_DEFS` / `COUPON_DEFS` / `CATEGORY_DEFS`
  arrays in `prisma/seed.ts` with the real menu, real class calendar, real
  coupons.
- Every product currently reuses its *category's* placeholder photo (7
  photos across 28 dishes) — see Images below.
- Run `npm run db:seed` once the real data is in, or `npm run db:reset`
  for a full wipe-and-reseed.
- The 20 seeded orders, 8 customers, and reviews are demo data for
  testing the admin dashboard and `/account` — safe to leave until you
  `db:reset` for launch. Anything created *through* the app (real orders,
  bookings, enquiries, coupons made in `/admin`) survives a normal
  `npm run dev`/`build`, since the seed step only runs against an empty
  database.

## Recipes

`content/recipes/*.mdx` — 5 recipes written to match the seeded menu
(Chettinad fish curry, Hyderabadi biryani, paneer butter masala, gulab
jamun, mango pickle). Replace or add `.mdx` files with Nikita's actual
recipes; each needs frontmatter matching the schema in
`src/lib/data/recipes.ts` (`title`, `description`, `image` — a key into
`lib/images.ts`'s category map — `servings`, `prepMinutes`,
`cookMinutes`, `difficulty`, `tags`, `relatedProductSlugs`,
`publishedAt`, `ingredients`), plus an MDX body for the method.

## Images

Every placeholder photo lives in `src/lib/images.ts` — swap the `src` on
each entry for Nikita's real photo. See that file's header comment for
the full explanation of why these are specific hotlinked Unsplash photos
rather than a live keyword search. Recipe pages and `/gallery` both pull
from this same map, so a swap here updates every page that uses it.

## Legal pages

`/privacy`, `/terms`, `/refund-policy`, `/shipping-and-delivery` ship as
real, specific content — grounded in the app's actual policies
(cancellation only before "Accepted", real delivery minimums/fees) — not
lorem ipsum. They still need a lawyer's or Razorpay onboarding
checklist's eyes before this is a real business's binding policy.

## Favicon

`src/app/favicon.ico` — confirm this is Nikita's real mark before
launch, not a placeholder icon.

## Payments

`MockProvider` is active by default (always succeeds, no setup). Flip to
real Razorpay test mode by setting `RAZORPAY_KEY_ID` /
`RAZORPAY_KEY_SECRET` / `NEXT_PUBLIC_RAZORPAY_KEY_ID` — see README.md
"Going live with Razorpay". **Not yet tested against a live Razorpay
account** — test thoroughly before trusting it with real money.
