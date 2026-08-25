const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/**
 * Formats a whole-rupee amount as "₹1,240". Amounts are stored as plain
 * rupee integers throughout the app — home-kitchen pricing doesn't need
 * paise-level precision, and it keeps cart and order math simple.
 */
export function formatINR(amount: number) {
  return inr.format(amount);
}
