/**
 * Seed script — full reset-and-reseed by default (`npm run db:seed`), or
 * a no-op if data already exists when run with `--if-empty` (that's how
 * `predev` calls it, so a normal `npm run dev` never wipes data you made
 * by hand while testing).
 */
import "dotenv/config";

import { PrismaClient } from "../src/generated/prisma/client";
import { images } from "../src/lib/images";
import { todayIso } from "../src/lib/kitchen";

const db = new PrismaClient();

const ifEmpty = process.argv.includes("--if-empty");

// ---------------------------------------------------------------------------
// Static content
// ---------------------------------------------------------------------------

const CATEGORY_DEFS = [
  { slug: "curries", name: "Curries", icon: "soup", image: images.categories.curries },
  { slug: "biryani", name: "Biryani", icon: "cooking-pot", image: images.categories.biryani },
  { slug: "snacks", name: "Snacks", icon: "sandwich", image: images.categories.snacks },
  { slug: "breads", name: "Breads", icon: "wheat", image: images.categories.breads },
  { slug: "sweets", name: "Sweets", icon: "candy", image: images.categories.sweets },
  { slug: "pickles", name: "Pickles", icon: "package", image: images.categories.pickles },
  { slug: "class-kits", name: "Class Kits", icon: "graduation-cap", image: images.categories.classKits },
] as const;

const ADDON_DEFS = [
  { name: "Extra raita", price: 30 },
  { name: "Extra roti, 2 pieces", price: 30 },
  { name: "Extra gravy", price: 40 },
  { name: "Papad, 2 pieces", price: 20 },
  { name: "Extra chutney", price: 15 },
  { name: "Onion salad", price: 20 },
] as const;

type ProductDef = {
  slug: string;
  name: string;
  description: string;
  category: (typeof CATEGORY_DEFS)[number]["slug"];
  vegType: "VEG" | "NON_VEG" | "JAIN";
  spiceLevel: 0 | 1 | 2 | 3;
  servesCount: number;
  basePrice: number;
  dailyLimit: number | null;
  leadTimeHours: 0 | 24;
  isTodaysSpecial?: boolean;
  popularity: number;
  variants?: { label: string; priceDelta: number }[];
  addOns?: string[];
};

const PRODUCT_DEFS: ProductDef[] = [
  // --- Curries ---------------------------------------------------------
  {
    slug: "chettinad-fish-curry",
    name: "Chettinad Fish Curry",
    description: "Pomfret simmered in a roasted-spice coconut base, mildly hot.",
    category: "curries",
    vegType: "NON_VEG",
    spiceLevel: 2,
    servesCount: 2,
    basePrice: 340,
    dailyLimit: 12,
    leadTimeHours: 0,
    isTodaysSpecial: true,
    popularity: 92,
    variants: [
      { label: "Half", priceDelta: -70 },
      { label: "Full", priceDelta: 0 },
    ],
    addOns: ["Extra raita", "Papad, 2 pieces"],
  },
  {
    slug: "paneer-butter-masala",
    name: "Paneer Butter Masala",
    description: "Paneer in a silky tomato-cashew gravy, a little sweet, a little tangy.",
    category: "curries",
    vegType: "VEG",
    spiceLevel: 1,
    servesCount: 2,
    basePrice: 260,
    dailyLimit: 20,
    leadTimeHours: 0,
    popularity: 88,
    variants: [
      { label: "Half", priceDelta: -60 },
      { label: "Full", priceDelta: 0 },
    ],
    addOns: ["Extra roti, 2 pieces", "Extra gravy"],
  },
  {
    slug: "dal-tadka",
    name: "Dal Tadka",
    description: "Yellow lentils tempered with ghee, cumin and curry leaves. No onion, no garlic.",
    category: "curries",
    vegType: "JAIN",
    spiceLevel: 1,
    servesCount: 2,
    basePrice: 180,
    dailyLimit: 25,
    leadTimeHours: 0,
    popularity: 75,
    variants: [
      { label: "Half", priceDelta: -40 },
      { label: "Full", priceDelta: 0 },
    ],
    addOns: ["Extra roti, 2 pieces"],
  },
  {
    slug: "kadai-chicken",
    name: "Kadai Chicken",
    description: "Chicken tossed with bell peppers in a coarse-ground kadai masala.",
    category: "curries",
    vegType: "NON_VEG",
    spiceLevel: 3,
    servesCount: 2,
    basePrice: 300,
    dailyLimit: 15,
    leadTimeHours: 0,
    popularity: 80,
    variants: [
      { label: "Half", priceDelta: -65 },
      { label: "Full", priceDelta: 0 },
    ],
    addOns: ["Extra raita", "Extra roti, 2 pieces"],
  },
  {
    slug: "egg-curry",
    name: "Egg Curry",
    description: "Boiled eggs in an onion-tomato masala. Good with rice or rotis.",
    category: "curries",
    vegType: "NON_VEG",
    spiceLevel: 2,
    servesCount: 2,
    basePrice: 220,
    dailyLimit: 18,
    leadTimeHours: 0,
    popularity: 60,
    variants: [
      { label: "Half", priceDelta: -50 },
      { label: "Full", priceDelta: 0 },
    ],
    addOns: ["Extra roti, 2 pieces"],
  },

  // --- Biryani -----------------------------------------------------------
  {
    slug: "hyderabadi-chicken-biryani",
    name: "Hyderabadi Chicken Biryani",
    description: "Dum-cooked with fried onions and mint, served with raita.",
    category: "biryani",
    vegType: "NON_VEG",
    spiceLevel: 2,
    servesCount: 2,
    basePrice: 320,
    dailyLimit: 15,
    leadTimeHours: 24,
    isTodaysSpecial: true,
    popularity: 95,
    variants: [
      { label: "Half", priceDelta: -70 },
      { label: "Full", priceDelta: 0 },
    ],
    addOns: ["Extra raita", "Onion salad"],
  },
  {
    slug: "mutton-biryani",
    name: "Mutton Biryani",
    description: "Slow dum-cooked with bone-in mutton that falls off in the first bite.",
    category: "biryani",
    vegType: "NON_VEG",
    spiceLevel: 2,
    servesCount: 2,
    basePrice: 420,
    dailyLimit: 10,
    leadTimeHours: 24,
    popularity: 85,
    variants: [
      { label: "Half", priceDelta: -90 },
      { label: "Full", priceDelta: 0 },
    ],
    addOns: ["Extra raita", "Onion salad"],
  },
  {
    slug: "vegetable-biryani",
    name: "Vegetable Biryani",
    description: "Basmati layered with seasonal vegetables and fried onions.",
    category: "biryani",
    vegType: "VEG",
    spiceLevel: 1,
    servesCount: 2,
    basePrice: 240,
    dailyLimit: 15,
    leadTimeHours: 0,
    popularity: 55,
    variants: [
      { label: "Half", priceDelta: -50 },
      { label: "Full", priceDelta: 0 },
    ],
    addOns: ["Extra raita"],
  },
  {
    slug: "prawn-biryani",
    name: "Prawn Biryani",
    description: "Quick-cooked prawns folded through saffron rice.",
    category: "biryani",
    vegType: "NON_VEG",
    spiceLevel: 2,
    servesCount: 2,
    basePrice: 360,
    dailyLimit: 8,
    leadTimeHours: 24,
    popularity: 65,
    variants: [
      { label: "Half", priceDelta: -75 },
      { label: "Full", priceDelta: 0 },
    ],
    addOns: ["Extra raita"],
  },

  // --- Snacks --------------------------------------------------------------
  {
    slug: "aloo-samosa",
    name: "Aloo Samosa, pair",
    description: "Hand-folded, fried to order, with tamarind and mint chutney.",
    category: "snacks",
    vegType: "VEG",
    spiceLevel: 1,
    servesCount: 1,
    basePrice: 80,
    dailyLimit: 40,
    leadTimeHours: 0,
    isTodaysSpecial: true,
    popularity: 90,
    addOns: ["Extra chutney"],
  },
  {
    slug: "vegetable-cutlet",
    name: "Vegetable Cutlet, pair",
    description: "Pan-fried potato and carrot cutlets, crumbed and golden.",
    category: "snacks",
    vegType: "VEG",
    spiceLevel: 1,
    servesCount: 1,
    basePrice: 90,
    dailyLimit: 30,
    leadTimeHours: 0,
    popularity: 58,
    addOns: ["Extra chutney"],
  },
  {
    slug: "chicken-65",
    name: "Chicken 65",
    description: "Deep-fried chicken tossed with curry leaves and dry red chilli.",
    category: "snacks",
    vegType: "NON_VEG",
    spiceLevel: 3,
    servesCount: 2,
    basePrice: 240,
    dailyLimit: 20,
    leadTimeHours: 0,
    popularity: 78,
  },
  {
    slug: "onion-pakora",
    name: "Onion Pakora",
    description: "Thin-sliced onions in a spiced gram-flour batter, fried to order.",
    category: "snacks",
    vegType: "VEG",
    spiceLevel: 2,
    servesCount: 2,
    basePrice: 120,
    dailyLimit: 25,
    leadTimeHours: 0,
    popularity: 62,
    addOns: ["Extra chutney"],
  },
  {
    slug: "dahi-puri",
    name: "Dahi Puri",
    description: "Crisp puris with potato, yoghurt, tamarind and mint chutney.",
    category: "snacks",
    vegType: "VEG",
    spiceLevel: 1,
    servesCount: 1,
    basePrice: 100,
    dailyLimit: 20,
    leadTimeHours: 0,
    popularity: 70,
  },

  // --- Breads --------------------------------------------------------------
  {
    slug: "tawa-phulka",
    name: "Tawa Phulka, 6 pieces",
    description: "Puffed on an open flame, brushed with ghee if you want it.",
    category: "breads",
    vegType: "JAIN",
    spiceLevel: 0,
    servesCount: 2,
    basePrice: 90,
    dailyLimit: 30,
    leadTimeHours: 0,
    popularity: 68,
  },
  {
    slug: "butter-naan",
    name: "Butter Naan, pair",
    description: "Leavened dough, blistered in the tawa, brushed with butter.",
    category: "breads",
    vegType: "VEG",
    spiceLevel: 0,
    servesCount: 1,
    basePrice: 70,
    dailyLimit: 30,
    leadTimeHours: 0,
    popularity: 72,
  },
  {
    slug: "garlic-naan",
    name: "Garlic Naan, pair",
    description: "Same dough, loaded with chopped garlic and coriander.",
    category: "breads",
    vegType: "VEG",
    spiceLevel: 0,
    servesCount: 1,
    basePrice: 80,
    dailyLimit: 25,
    leadTimeHours: 0,
    popularity: 66,
  },
  {
    slug: "laccha-paratha",
    name: "Laccha Paratha, pair",
    description: "Layered and flaky, a little ghee, no filling needed.",
    category: "breads",
    vegType: "VEG",
    spiceLevel: 0,
    servesCount: 1,
    basePrice: 70,
    dailyLimit: 25,
    leadTimeHours: 0,
    popularity: 58,
  },

  // --- Sweets --------------------------------------------------------------
  {
    slug: "til-gud-ladoo",
    name: "Til-Gud Ladoo, box of 6",
    description: "Sesame and jaggery, rolled the old way — no refined sugar.",
    category: "sweets",
    vegType: "VEG",
    spiceLevel: 0,
    servesCount: 6,
    basePrice: 220,
    dailyLimit: 20,
    leadTimeHours: 0,
    isTodaysSpecial: true,
    popularity: 74,
    variants: [
      { label: "250g", priceDelta: 0 },
      { label: "500g", priceDelta: 190 },
      { label: "1kg", priceDelta: 370 },
    ],
  },
  {
    slug: "kaju-katli",
    name: "Kaju Katli, 250g",
    description: "Cashew fudge, thin-cut, finished with a little silver leaf.",
    category: "sweets",
    vegType: "VEG",
    spiceLevel: 0,
    servesCount: 4,
    basePrice: 280,
    dailyLimit: 15,
    leadTimeHours: 24,
    popularity: 80,
    variants: [
      { label: "250g", priceDelta: 0 },
      { label: "500g", priceDelta: 260 },
    ],
  },
  {
    slug: "gulab-jamun",
    name: "Gulab Jamun, box of 8",
    description: "Milk-solid dumplings in warm cardamom syrup.",
    category: "sweets",
    vegType: "VEG",
    spiceLevel: 0,
    servesCount: 4,
    basePrice: 180,
    dailyLimit: 25,
    leadTimeHours: 0,
    popularity: 84,
  },
  {
    slug: "rava-kesari",
    name: "Rava Kesari",
    description: "Semolina cooked in ghee with saffron and cashews.",
    category: "sweets",
    vegType: "JAIN",
    spiceLevel: 0,
    servesCount: 3,
    basePrice: 150,
    dailyLimit: 20,
    leadTimeHours: 0,
    popularity: 50,
  },

  // --- Pickles -------------------------------------------------------------
  {
    slug: "mango-pickle",
    name: "Mango Pickle, 250g",
    description: "Raw mango in mustard oil, the way it's meant to bite back.",
    category: "pickles",
    vegType: "VEG",
    spiceLevel: 2,
    servesCount: 8,
    basePrice: 180,
    dailyLimit: null,
    leadTimeHours: 0,
    popularity: 70,
    variants: [
      { label: "250g", priceDelta: 0 },
      { label: "500g", priceDelta: 160 },
    ],
  },
  {
    slug: "lemon-pickle",
    name: "Lemon Pickle, 250g",
    description: "Whole lemons cured slow in salt and chilli. No onion, no garlic.",
    category: "pickles",
    vegType: "JAIN",
    spiceLevel: 2,
    servesCount: 8,
    basePrice: 160,
    dailyLimit: null,
    leadTimeHours: 0,
    popularity: 55,
    variants: [
      { label: "250g", priceDelta: 0 },
      { label: "500g", priceDelta: 140 },
    ],
  },
  {
    slug: "garlic-pickle",
    name: "Garlic Pickle, 250g",
    description: "Whole garlic cloves in a tamarind-chilli base.",
    category: "pickles",
    vegType: "VEG",
    spiceLevel: 3,
    servesCount: 8,
    basePrice: 190,
    dailyLimit: null,
    leadTimeHours: 0,
    popularity: 48,
    variants: [
      { label: "250g", priceDelta: 0 },
      { label: "500g", priceDelta: 170 },
    ],
  },

  // --- Class kits ------------------------------------------------------
  {
    slug: "biryani-masala-kit",
    name: "Biryani Masala Kit",
    description: "Every spice pre-measured for a restaurant-style dum biryani at home, with my written method.",
    category: "class-kits",
    vegType: "VEG",
    spiceLevel: 0,
    servesCount: 4,
    basePrice: 450,
    dailyLimit: null,
    leadTimeHours: 24,
    popularity: 40,
  },
  {
    slug: "pickle-making-kit",
    name: "Pickle-Making Kit",
    description: "Raw mango, whole spices and mustard oil, measured out to make your own jar.",
    category: "class-kits",
    vegType: "VEG",
    spiceLevel: 0,
    servesCount: 1,
    basePrice: 380,
    dailyLimit: null,
    leadTimeHours: 24,
    popularity: 28,
  },
  {
    slug: "south-indian-breakfast-kit",
    name: "South Indian Breakfast Kit",
    description: "Batter, chutney podi and sambar masala for a week of dosas at home.",
    category: "class-kits",
    vegType: "VEG",
    spiceLevel: 1,
    servesCount: 4,
    basePrice: 420,
    dailyLimit: null,
    leadTimeHours: 24,
    popularity: 35,
  },
];

const CLASS_DEFS = [
  {
    slug: "sunday-biryani-workshop",
    title: "Sunday Biryani Workshop",
    description:
      "Three hours, one pot, no shortcuts — you'll leave knowing why dum matters and able to make it without a recipe card.",
    mode: "IN_PERSON" as const,
    daysFromNow: 4,
    hour: 10,
    durationMinutes: 180,
    price: 1800,
    seatsTotal: 8,
    image: images.pages.classes,
  },
  {
    slug: "weeknight-curries-online",
    title: "Weeknight Curries, Online",
    description:
      "Four curries you can build from one spice base, cooked live over video so you can pause me when you fall behind.",
    mode: "ONLINE" as const,
    daysFromNow: 2,
    hour: 19,
    durationMinutes: 90,
    price: 900,
    seatsTotal: 20,
    image: images.categories.curries,
  },
  {
    slug: "south-indian-breakfast-basics",
    title: "South Indian Breakfast Basics",
    description:
      "Dosa batter from scratch, the right consistency, and how to actually get it off the tawa in one piece.",
    mode: "IN_PERSON" as const,
    daysFromNow: 9,
    hour: 9,
    durationMinutes: 150,
    price: 1500,
    seatsTotal: 6,
    image: images.categories.breads,
  },
  {
    slug: "pickles-and-preserves",
    title: "Pickles & Preserves",
    description:
      "Make a jar of mango pickle you'll actually be proud of, and learn the ratios so you never need a recipe again.",
    mode: "IN_PERSON" as const,
    daysFromNow: 12,
    hour: 11,
    durationMinutes: 120,
    price: 1200,
    seatsTotal: 10,
    image: images.categories.pickles,
  },
  {
    slug: "festive-sweets-workshop",
    title: "Festive Sweets Workshop",
    description: "Kaju katli and rava kesari, done properly, over video, in time for the festival table.",
    mode: "ONLINE" as const,
    daysFromNow: 16,
    hour: 18,
    durationMinutes: 120,
    price: 1100,
    seatsTotal: 25,
    image: images.categories.sweets,
  },
  {
    slug: "kids-saturday-kitchen",
    title: "Kids' Saturday Kitchen",
    description: "Simple, mess-friendly recipes for ages 7 and up — a parent stays, everyone gets an apron.",
    mode: "IN_PERSON" as const,
    daysFromNow: 6,
    hour: 11,
    durationMinutes: 90,
    price: 900,
    seatsTotal: 8,
    image: images.categories.snacks,
  },
];

const COUPON_DEFS = [
  { code: "WELCOME10", type: "PERCENTAGE" as const, value: 10, minOrderValue: 300, firstOrderOnly: true },
  { code: "FREESHIP", type: "FREE_DELIVERY" as const, value: 0, minOrderValue: 500, firstOrderOnly: false },
  { code: "FLAT50", type: "FLAT" as const, value: 50, minOrderValue: 400, firstOrderOnly: false },
  {
    code: "DIWALI20",
    type: "PERCENTAGE" as const,
    value: 20,
    minOrderValue: 600,
    firstOrderOnly: false,
    maxUses: 100,
    usedCount: 42,
    expiresAt: daysFromNow(30),
  },
  {
    code: "SORRY100",
    type: "FLAT" as const,
    value: 100,
    minOrderValue: null,
    firstOrderOnly: false,
    maxUses: 50,
    usedCount: 50,
    isActive: false,
  },
];

const REVIEW_DEFS: {
  customerName: string;
  rating: number;
  quote: string;
  detail: string;
  productSlug?: string;
  classSlug?: string;
}[] = [
  {
    customerName: "Divya R.",
    rating: 5,
    quote:
      "Ordered the fish curry on a whim on a Tuesday and now it's a whim I have every week. Tastes like someone's actual mother made it, because someone's actual mother made it.",
    detail: "Ordered: Chettinad Fish Curry",
    productSlug: "chettinad-fish-curry",
  },
  {
    customerName: "Arjun M.",
    rating: 5,
    quote:
      "Did the biryani workshop with my sister for her birthday. We were bad at it. Nikita was patient about it. We went home and made it again the next day and it worked.",
    detail: "Attended: Sunday Biryani Workshop",
    classSlug: "sunday-biryani-workshop",
  },
  {
    customerName: "Priya S.",
    rating: 5,
    quote:
      "Used her for a 30-person office lunch and didn't have to think about a single thing after I sent the enquiry. Food showed up hot, on time, labelled.",
    detail: "Booked: Office catering",
  },
  {
    customerName: "Karthik N.",
    rating: 5,
    quote: "The mutton biryani is the only dum biryani I've had outside my grandmother's kitchen that tastes right.",
    detail: "Ordered: Mutton Biryani",
    productSlug: "mutton-biryani",
  },
  {
    customerName: "Fatima A.",
    rating: 4,
    quote:
      "Samosas held up perfectly on a 40-minute delivery, which is more than I can say for the last three places I've tried.",
    detail: "Ordered: Aloo Samosa",
    productSlug: "aloo-samosa",
  },
  {
    customerName: "Rohan T.",
    rating: 5,
    quote: "The paneer butter masala doesn't taste like restaurant paneer butter masala, which is exactly the point.",
    detail: "Ordered: Paneer Butter Masala",
    productSlug: "paneer-butter-masala",
  },
  {
    customerName: "Meera V.",
    rating: 5,
    quote: "My mother-in-law asked for the recipe. I did not tell her it wasn't mine.",
    detail: "Ordered: Dal Tadka",
    productSlug: "dal-tadka",
  },
  {
    customerName: "Sanjay K.",
    rating: 4,
    quote: "The pickle-making class ran long, in the good way — nobody wanted to leave once the tasting started.",
    detail: "Attended: Pickles & Preserves",
    classSlug: "pickles-and-preserves",
  },
  {
    customerName: "Lakshmi B.",
    rating: 5,
    quote: "Kaju katli disappeared inside a family gathering in about four minutes. I ordered again the same night.",
    detail: "Ordered: Kaju Katli",
    productSlug: "kaju-katli",
  },
  {
    customerName: "Vikram P.",
    rating: 5,
    quote:
      "Did the online curry class with my brother in another city, both cooking at the same time on a video call. Weirdly one of the best evenings we've had in years.",
    detail: "Attended: Weeknight Curries, Online",
    classSlug: "weeknight-curries-online",
  },
  {
    customerName: "Anjali D.",
    rating: 5,
    quote: "Chicken 65 has real curry leaf char on it, not the sad soggy version most places send out.",
    detail: "Ordered: Chicken 65",
    productSlug: "chicken-65",
  },
  {
    customerName: "Ibrahim S.",
    rating: 4,
    quote: "Booked the breakfast kit for my mother who lives alone — she said it was the first proper dosa she'd made in a year.",
    detail: "Ordered: South Indian Breakfast Kit",
    productSlug: "south-indian-breakfast-kit",
  },
];

const CUSTOMER_DEFS = [
  { name: "Divya Ramesh", phone: "9820011122", city: "Andheri West" },
  { name: "Arjun Mehta", phone: "9820011133", city: "Bandra" },
  { name: "Priya Shah", phone: "9820011144", city: "Powai" },
  { name: "Karthik Nair", phone: "9820011155", city: "Andheri West" },
  { name: "Fatima Ansari", phone: "9820011166", city: "Juhu" },
  { name: "Rohan Toshniwal", phone: "9820011177", city: "Versova" },
  { name: "Meera Venkat", phone: "9820011188", city: "Andheri West" },
  { name: "Sanjay Kulkarni", phone: "9820011199", city: "Bandra" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

// IST's calendar date, not the server's local one or toISOString()'s
// UTC one — reuses lib/kitchen.ts's todayIso so the seed data and the
// live app agree on what day "today" is regardless of what timezone
// this script happens to run in.
const isoDate = todayIso;

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

// ---------------------------------------------------------------------------
// Seed steps
// ---------------------------------------------------------------------------

async function wipe() {
  await db.orderItemOption.deleteMany();
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.booking.deleteMany();
  await db.review.deleteMany();
  await db.enquiry.deleteMany();
  await db.newsletterSignup.deleteMany();
  await db.productVariant.deleteMany();
  await db.product.deleteMany();
  await db.addOn.deleteMany();
  await db.category.deleteMany();
  await db.classSession.deleteMany();
  await db.coupon.deleteMany();
  await db.timeSlot.deleteMany();
  await db.kitchenHoliday.deleteMany();
  await db.address.deleteMany();
  await db.customer.deleteMany();
}

async function seedCategories() {
  const categories = new Map<string, string>();
  for (const [i, def] of CATEGORY_DEFS.entries()) {
    const category = await db.category.create({
      data: { slug: def.slug, name: def.name, icon: def.icon, sortOrder: i },
    });
    categories.set(def.slug, category.id);
  }
  return categories;
}

async function seedAddOns() {
  const addOns = new Map<string, string>();
  for (const def of ADDON_DEFS) {
    const addOn = await db.addOn.create({ data: { name: def.name, price: def.price } });
    addOns.set(def.name, addOn.id);
  }
  return addOns;
}

async function seedProducts(categories: Map<string, string>, addOns: Map<string, string>) {
  const products = new Map<string, { id: string; basePrice: number; variantIds: Map<string, { id: string; priceDelta: number }> }>();

  for (const def of PRODUCT_DEFS) {
    const categoryId = categories.get(def.category);
    if (!categoryId) throw new Error(`Unknown category ${def.category}`);
    const image = CATEGORY_DEFS.find((c) => c.slug === def.category)!.image.src;

    const product = await db.product.create({
      data: {
        slug: def.slug,
        name: def.name,
        description: def.description,
        categoryId,
        vegType: def.vegType,
        spiceLevel: def.spiceLevel,
        servesCount: def.servesCount,
        basePrice: def.basePrice,
        image,
        dailyLimit: def.dailyLimit,
        leadTimeHours: def.leadTimeHours,
        isTodaysSpecial: def.isTodaysSpecial ?? false,
        popularity: def.popularity,
        addOns: def.addOns
          ? { connect: def.addOns.map((name) => ({ id: addOns.get(name) })) }
          : undefined,
        variants: def.variants
          ? {
              create: def.variants.map((v, i) => ({
                label: v.label,
                priceDelta: v.priceDelta,
                isDefault: v.priceDelta === 0,
                sortOrder: i,
              })),
            }
          : undefined,
      },
      include: { variants: true },
    });

    const variantIds = new Map<string, { id: string; priceDelta: number }>();
    for (const v of product.variants) {
      variantIds.set(v.label, { id: v.id, priceDelta: v.priceDelta });
    }
    products.set(def.slug, { id: product.id, basePrice: product.basePrice, variantIds });
  }

  return products;
}

async function seedTimeSlots() {
  const defs = [
    { label: "12:00 PM – 1:00 PM", startTime: "12:00", endTime: "13:00", capacity: 10 },
    { label: "1:00 PM – 2:00 PM", startTime: "13:00", endTime: "14:00", capacity: 10 },
    { label: "7:00 PM – 8:00 PM", startTime: "19:00", endTime: "20:00", capacity: 12 },
    { label: "8:00 PM – 9:00 PM", startTime: "20:00", endTime: "21:00", capacity: 12 },
  ];
  const slots: string[] = [];
  for (const [i, def] of defs.entries()) {
    const slot = await db.timeSlot.create({ data: { ...def, sortOrder: i } });
    slots.push(slot.id);
  }
  return slots;
}

async function seedKitchenHolidays() {
  await db.kitchenHoliday.create({
    data: { date: daysFromNow(21), reason: "Family function — kitchen closed" },
  });
}

async function seedCoupons() {
  for (const def of COUPON_DEFS) {
    await db.coupon.create({
      data: {
        code: def.code,
        type: def.type,
        value: def.value,
        minOrderValue: def.minOrderValue ?? null,
        firstOrderOnly: def.firstOrderOnly,
        maxUses: "maxUses" in def ? def.maxUses : null,
        usedCount: "usedCount" in def ? def.usedCount ?? 0 : 0,
        expiresAt: "expiresAt" in def ? def.expiresAt : null,
        isActive: "isActive" in def ? def.isActive : true,
      },
    });
  }
}

async function seedClasses() {
  const classes = new Map<string, string>();
  for (const def of CLASS_DEFS) {
    const dateTime = daysFromNow(def.daysFromNow);
    dateTime.setHours(def.hour, 0, 0, 0);
    const session = await db.classSession.create({
      data: {
        slug: def.slug,
        title: def.title,
        description: def.description,
        mode: def.mode,
        dateTime,
        durationMinutes: def.durationMinutes,
        price: def.price,
        seatsTotal: def.seatsTotal,
        image: def.image.src,
      },
    });
    classes.set(def.slug, session.id);
  }
  return classes;
}

async function seedCustomersAndOrders(
  products: Map<string, { id: string; basePrice: number; variantIds: Map<string, { id: string; priceDelta: number }> }>,
  timeSlotIds: string[]
) {
  const customers: { id: string; name: string; phone: string; addressId: string }[] = [];
  for (const def of CUSTOMER_DEFS) {
    const customer = await db.customer.create({
      data: {
        name: def.name,
        phone: def.phone,
        addresses: {
          create: {
            label: "Home",
            line1: `${10 + customers.length * 3}, Sea Breeze Apartments`,
            city: def.city,
            pincode: "400058",
            isDefault: true,
          },
        },
      },
      include: { addresses: true },
    });
    customers.push({ id: customer.id, name: customer.name, phone: customer.phone, addressId: customer.addresses[0].id });
  }

  const productList = Array.from(products.entries());
  const statuses: ("RECEIVED" | "ACCEPTED" | "COOKING" | "READY" | "OUT_FOR_DELIVERY" | "COMPLETED" | "CANCELLED")[] = [
    "COMPLETED", "COMPLETED", "COMPLETED", "COMPLETED", "COMPLETED", "COMPLETED",
    "COMPLETED", "COMPLETED", "COMPLETED", "COMPLETED", "COMPLETED", "COMPLETED",
    "OUT_FOR_DELIVERY", "READY", "COOKING", "COOKING", "ACCEPTED", "RECEIVED",
    "CANCELLED", "COMPLETED",
  ];

  const GST_RATE = 0.05;

  for (let i = 0; i < 20; i++) {
    const customer = pick(customers, i);
    const status = statuses[i];
    const isToday = i >= 12; // the last 8 orders are "live" and dated today
    const fulfilment: "DELIVERY" | "PICKUP" = i % 4 === 0 ? "PICKUP" : "DELIVERY";

    // Deliberately push prawn-biryani (dailyLimit 8) to sold out today —
    // a real demonstration of the daily-capacity feature, not a mock state.
    const forcedSlug = i === 12 || i === 13 ? "prawn-biryani" : undefined;
    const product = forcedSlug ? products.get(forcedSlug)! : pick(productList, i * 3 + 1)[1];
    const product2 = pick(productList, i * 3 + 2)[1];

    const variant1 = Array.from(product.variantIds.values())[i % Math.max(product.variantIds.size, 1)];
    const qty1 = forcedSlug ? 4 : 1 + (i % 2);
    const unitPrice1 = product.basePrice + (variant1?.priceDelta ?? 0);

    const variant2 = Array.from(product2.variantIds.values())[(i + 1) % Math.max(product2.variantIds.size, 1)];
    const qty2 = 1;
    const unitPrice2 = product2.basePrice + (variant2?.priceDelta ?? 0);

    const addOnLabel = i % 4 === 1 ? "Extra raita" : null;
    const addOnPrice = addOnLabel ? 30 : 0;

    const itemTotal =
      unitPrice1 * qty1 + addOnPrice + (i % 3 !== 0 ? unitPrice2 * qty2 : 0);
    const packagingFee = 20;
    const deliveryFee = fulfilment === "DELIVERY" ? (itemTotal >= 500 ? 0 : 40) : 0;
    const gstAmount = Math.round(itemTotal * GST_RATE);
    const grandTotal = itemTotal + packagingFee + deliveryFee + gstAmount;

    const createdAt = isToday ? new Date() : daysFromNow(-(i + 1));
    const orderNumber = `CWN-${createdAt.getFullYear().toString().slice(2)}${(createdAt.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${createdAt.getDate().toString().padStart(2, "0")}-${(1000 + i).toString()}`;

    await db.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        guestName: customer.name,
        guestPhone: customer.phone,
        fulfilment,
        addressId: fulfilment === "DELIVERY" ? customer.addressId : null,
        pincode: fulfilment === "DELIVERY" ? "400058" : null,
        scheduledDate: isoDate(createdAt),
        slotId: pick(timeSlotIds, i),
        status,
        deliveryNotes: i % 5 === 0 ? "Please call before arriving, gate code is 1234." : null,
        itemTotal,
        packagingFee,
        deliveryFee,
        discountAmount: 0,
        gstAmount,
        grandTotal,
        paymentMethod: i % 3 === 0 ? "COD" : "MOCK",
        paymentStatus: status === "CANCELLED" ? "REFUNDED" : "PAID",
        createdAt,
        updatedAt: createdAt,
        items: {
          create: [
            {
              productId: product.id,
              variantId: variant1?.id,
              quantity: qty1,
              unitPrice: unitPrice1,
              spiceLevel: null,
              specialInstructions: i % 6 === 0 ? "Light on the salt please." : null,
              options: addOnLabel
                ? { create: [{ label: addOnLabel, priceDelta: addOnPrice }] }
                : undefined,
            },
            ...(i % 3 !== 0
              ? [
                  {
                    productId: product2.id,
                    variantId: variant2?.id,
                    quantity: qty2,
                    unitPrice: unitPrice2,
                  },
                ]
              : []),
          ],
        },
      },
    });
  }

  return customers;
}

async function seedBookings(classes: Map<string, string>, customers: { id: string; name: string; phone: string }[]) {
  const bookingDefs = [
    { classSlug: "sunday-biryani-workshop", seats: 2, customerIndex: 0 },
    { classSlug: "sunday-biryani-workshop", seats: 1, customerIndex: 3 },
    { classSlug: "weeknight-curries-online", seats: 1, customerIndex: 5 },
    { classSlug: "festive-sweets-workshop", seats: 2, customerIndex: 6 },
  ];
  for (const def of bookingDefs) {
    const classSessionId = classes.get(def.classSlug);
    const customer = customers[def.customerIndex];
    if (!classSessionId || !customer) continue;
    const session = await db.classSession.findUniqueOrThrow({ where: { id: classSessionId } });
    await db.booking.create({
      data: {
        classSessionId,
        customerId: customer.id,
        guestName: customer.name,
        guestPhone: customer.phone,
        seats: def.seats,
        amountPaid: session.price * def.seats,
        paymentStatus: "PAID",
        status: "CONFIRMED",
      },
    });
  }
}

async function seedReviews(products: Map<string, { id: string }>, classes: Map<string, string>) {
  for (const def of REVIEW_DEFS) {
    await db.review.create({
      data: {
        customerName: def.customerName,
        rating: def.rating,
        quote: def.quote,
        detail: def.detail,
        productId: def.productSlug ? products.get(def.productSlug)?.id : undefined,
        classSessionId: def.classSlug ? classes.get(def.classSlug) : undefined,
      },
    });
  }
}

async function seedEnquiries() {
  await db.enquiry.createMany({
    data: [
      {
        type: "CATERING",
        name: "Neha Joshi",
        phone: "9820055566",
        email: "neha.joshi@example.com",
        message: "Looking for lunch catering for a 25-person office offsite next month, mostly vegetarian.",
        guestCount: 25,
        eventDate: isoDate(daysFromNow(25)),
        cuisine: "North Indian",
        budgetBand: "₹15,000 – ₹25,000",
        status: "NEW",
      },
      {
        type: "CATERING",
        name: "Aditya Rao",
        phone: "9820066677",
        message: "Need dinner for a 50th birthday, around 40 guests, mix of veg and non-veg.",
        guestCount: 40,
        eventDate: isoDate(daysFromNow(40)),
        cuisine: "South Indian",
        budgetBand: "₹30,000+",
        status: "RESPONDED",
      },
      {
        type: "CONTACT",
        name: "Sameera Khan",
        phone: "9820077788",
        message: "Do you deliver to Chembur? Couldn't tell from the pincode checker.",
        status: "CLOSED",
      },
    ],
  });
}

async function seedNewsletterSignups() {
  await db.newsletterSignup.createMany({
    data: [
      { email: "amit.verma@example.com" },
      { email: "sneha.iyer@example.com" },
      { email: "rahul.desai@example.com" },
    ],
  });
}

// ---------------------------------------------------------------------------

async function main() {
  if (ifEmpty) {
    const existing = await db.category.count();
    if (existing > 0) {
      console.log("Database already has data — skipping seed.");
      return;
    }
  }

  console.log("Seeding…");
  await wipe();
  const categories = await seedCategories();
  const addOns = await seedAddOns();
  const products = await seedProducts(categories, addOns);
  const timeSlots = await seedTimeSlots();
  await seedKitchenHolidays();
  await seedCoupons();
  const classes = await seedClasses();
  const customers = await seedCustomersAndOrders(products, timeSlots);
  await seedBookings(classes, customers);
  await seedReviews(products, classes);
  await seedEnquiries();
  await seedNewsletterSignups();
  console.log(
    `Done — ${categories.size} categories, ${products.size} products, ${classes.size} classes, 20 orders.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
