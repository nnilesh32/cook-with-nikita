import { z } from "zod";

export const checkoutSchema = z
  .object({
    fulfilment: z.enum(["DELIVERY", "PICKUP"]),
    date: z.string().min(1, "Pick a date"),
    slotId: z.string().min(1, "Pick a time slot"),
    name: z.string().min(2, "Enter your name").max(80),
    phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit phone number"),
    otpVerified: z.boolean().refine((v) => v === true, "Verify your phone number"),
    line1: z.string().optional(),
    line2: z.string().optional(),
    city: z.string().optional(),
    pincode: z.string().optional(),
    deliveryNotes: z.string().max(300).optional(),
    couponCode: z.string().optional(),
    paymentMethod: z.enum(["ONLINE", "COD"]),
  })
  .superRefine((data, ctx) => {
    if (data.fulfilment !== "DELIVERY") return;
    if (!data.line1 || data.line1.trim().length < 3) {
      ctx.addIssue({ code: "custom", message: "Enter your address", path: ["line1"] });
    }
    if (!data.city || data.city.trim().length < 2) {
      ctx.addIssue({ code: "custom", message: "Enter your city", path: ["city"] });
    }
    if (!data.pincode || !/^\d{6}$/.test(data.pincode)) {
      ctx.addIssue({ code: "custom", message: "Enter a 6-digit pincode", path: ["pincode"] });
    }
  });

export type CheckoutValues = z.infer<typeof checkoutSchema>;

export const STEP_FIELDS: Record<number, (keyof CheckoutValues)[]> = {
  1: ["fulfilment"],
  2: ["date", "slotId"],
  3: ["name", "phone", "otpVerified", "line1", "city", "pincode"],
  4: ["paymentMethod"],
};

export const STEP_LABELS = ["Fulfilment", "When", "Details", "Pay"] as const;
