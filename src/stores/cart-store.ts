import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Cart state — persisted to localStorage. */

export type CartLineOption = {
  label: string;
  priceDelta: number;
};

export type CartLine = {
  /** Unique per product + option combination, not just per product. */
  id: string;
  productId: string;
  /** Null/omitted for products with no variants. Kept alongside the
   * display-only `options` below so the server can re-look-up the exact
   * configuration's authoritative price at checkout, rather than
   * trusting `unitPrice` from the client. */
  variantId?: string | null;
  addOnIds?: string[];
  /** The customer's requested spice level for dishes that offer a
   * choice (1 mild – 3 hot); omitted for dishes with no spice picker.
   * Part of what buildLineId() keys on, so a different pick is a
   * different line, not a merged quantity bump. */
  spiceLevel?: number | null;
  name: string;
  image: string;
  /** Fully-loaded per-unit price — variant delta and add-ons already
   * folded in. `options` below is for display only; don't add it again
   * when computing totals. */
  unitPrice: number;
  quantity: number;
  options?: CartLineOption[];
  note?: string;
};

export type AppliedCoupon = {
  code: string;
  discountAmount: number;
  freeDelivery: boolean;
  message: string;
};

type CartState = {
  lines: CartLine[];
  hasHydrated: boolean;
  isOpen: boolean;
  coupon: AppliedCoupon | null;
  setHasHydrated: (value: boolean) => void;
  addLine: (line: CartLine) => void;
  removeLine: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
  setCartOpen: (open: boolean) => void;
  setCoupon: (coupon: AppliedCoupon | null) => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      hasHydrated: false,
      isOpen: false,
      coupon: null,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      addLine: (line) =>
        set((state) => {
          const existing = state.lines.find((l) => l.id === line.id);
          const lines = existing
            ? state.lines.map((l) =>
                l.id === line.id
                  ? // Same configuration (same id), so just bump the
                    // quantity — but take the newest note rather than
                    // silently keeping whatever was typed the first
                    // time this line was added.
                    { ...l, quantity: l.quantity + line.quantity, note: line.note ?? l.note }
                  : l
              )
            : [...state.lines, line];
          // Adding an item opens the drawer — the brief-mandated "brief
          // confirm animation" on add.
          return { lines, isOpen: true };
        }),
      removeLine: (id) =>
        set((state) => ({ lines: state.lines.filter((l) => l.id !== id) })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          lines: state.lines.map((l) => (l.id === id ? { ...l, quantity } : l)),
        })),
      clear: () => set({ lines: [], coupon: null }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      setCartOpen: (open) => set({ isOpen: open }),
      setCoupon: (coupon) => set({ coupon }),
    }),
    {
      name: "cwn-cart",
      // Cart persists across reloads, but we render an empty cart on the
      // server every time — rehydration only happens client-side, after
      // mount, so the header badge doesn't flash a hydration mismatch.
      // `isOpen` is deliberately excluded: a page reload should never
      // reopen the drawer.
      partialize: (state) => ({ lines: state.lines, coupon: state.coupon }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export function useCartCount() {
  return useCartStore((state) =>
    state.hasHydrated
      ? state.lines.reduce((sum, line) => sum + line.quantity, 0)
      : 0
  );
}

export function useCartSubtotal() {
  return useCartStore((state) =>
    state.lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)
  );
}
