"use server";

import { z } from "zod";

import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

const enquirySchema = z.object({
  type: z.enum(["CATERING", "CONTACT", "GENERAL"]),
  name: z.string().min(2, "Enter your name").max(80),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit phone number"),
  email: z.string().email().optional().or(z.literal("")),
  message: z.string().min(10, "Tell me a little more").max(1000),
  guestCount: z.number().int().min(1).max(2000).optional(),
  eventDate: z.string().optional(),
  cuisine: z.string().optional(),
  budgetBand: z.string().optional(),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;

export async function submitEnquiryAction(input: EnquiryInput) {
  const parsed = enquirySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }
  const data = parsed.data;

  if (!rateLimit(`enquiry:${data.phone}`, 5, 60 * 60 * 1000)) {
    return { success: false as const, error: "Too many messages sent recently — message the kitchen on WhatsApp instead." };
  }

  await db.enquiry.create({
    data: {
      type: data.type,
      name: data.name,
      phone: data.phone,
      email: data.email || undefined,
      message: data.message,
      guestCount: data.guestCount,
      eventDate: data.eventDate || undefined,
      cuisine: data.cuisine || undefined,
      budgetBand: data.budgetBand || undefined,
    },
  });

  return { success: true as const };
}
