"use server";

import { z } from "zod";

import { db } from "@/lib/db";
import { type RazorpayCheckoutConfig, getPaymentProvider } from "@/lib/payments";
import { rateLimit } from "@/lib/rate-limit";

const bookSchema = z.object({
  classSessionId: z.string().min(1),
  name: z.string().min(2, "Enter your name").max(80),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit phone number"),
  email: z.string().email().optional().or(z.literal("")),
  seats: z.number().int().min(1).max(6),
});

export type BookClassInput = z.infer<typeof bookSchema>;

export type BookClassResult =
  | { success: true; bookingId: string; checkout?: RazorpayCheckoutConfig }
  | { success: false; error: string };

class SeatsUnavailableError extends Error {
  constructor(public seatsRemaining: number) {
    super("Not enough seats remaining");
  }
}

export async function bookClassAction(input: BookClassInput): Promise<BookClassResult> {
  const parsed = bookSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }
  const data = parsed.data;

  if (!rateLimit(`class-booking:${data.phone}`, 5, 60 * 60 * 1000)) {
    return { success: false, error: "Too many booking attempts from this number — message the kitchen if you need help." };
  }

  const session = await db.classSession.findUnique({ where: { id: data.classSessionId } });
  if (!session) return { success: false, error: "That class couldn't be found." };
  if (session.dateTime.getTime() < Date.now()) {
    return { success: false, error: "That class has already happened." };
  }

  const customer = await db.customer.upsert({
    where: { phone: data.phone },
    update: { name: data.name },
    create: { name: data.name, phone: data.phone },
  });

  const amountPaid = session.price * data.seats;

  // Seat-check-then-create as two separate queries would let two
  // concurrent bookings for the last seat(s) both pass the check before
  // either commits, overselling the class. Doing both inside one
  // transaction serializes them — SQLite only allows one writer at a
  // time, so the second booking's aggregate re-read here genuinely sees
  // the first one's seats.
  let booking;
  try {
    booking = await db.$transaction(async (tx) => {
      const bookedAgg = await tx.booking.aggregate({
        where: { classSessionId: session.id, status: { not: "CANCELLED" } },
        _sum: { seats: true },
      });
      const seatsRemaining = session.seatsTotal - (bookedAgg._sum.seats ?? 0);
      if (data.seats > seatsRemaining) {
        throw new SeatsUnavailableError(seatsRemaining);
      }

      return tx.booking.create({
        data: {
          classSessionId: session.id,
          customerId: customer.id,
          guestName: data.name,
          guestPhone: data.phone,
          guestEmail: data.email || undefined,
          seats: data.seats,
          amountPaid,
          paymentStatus: "PENDING",
          status: "CONFIRMED",
        },
      });
    });
  } catch (error) {
    if (error instanceof SeatsUnavailableError) {
      return {
        success: false,
        error:
          error.seatsRemaining <= 0
            ? "This class is fully booked."
            : `Only ${error.seatsRemaining} seat${error.seatsRemaining === 1 ? "" : "s"} left — reduce the number of seats and try again.`,
      };
    }
    throw error;
  }

  const provider = getPaymentProvider();
  const chargeResult = await provider.charge({
    orderId: booking.id,
    orderNumber: `CLASS-${booking.id.slice(-8).toUpperCase()}`,
    amountInRupees: amountPaid,
    customerName: data.name,
    customerPhone: data.phone,
    customerEmail: data.email || undefined,
  });

  if (chargeResult.status === "paid") {
    await db.booking.update({
      where: { id: booking.id },
      data: { paymentStatus: "PAID", paymentReference: chargeResult.reference },
    });
    return { success: true, bookingId: booking.id };
  }

  if (chargeResult.status === "requires_client_action") {
    await db.booking.update({
      where: { id: booking.id },
      data: { razorpayOrderId: chargeResult.checkout.razorpayOrderId },
    });
    return { success: true, bookingId: booking.id, checkout: chargeResult.checkout };
  }

  await db.booking.update({ where: { id: booking.id }, data: { status: "CANCELLED" } });
  return {
    success: false,
    error: `Payment failed: ${chargeResult.reason}. Try again, or message the kitchen to book a seat directly.`,
  };
}

const confirmSchema = z.object({
  bookingId: z.string(),
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});

export async function confirmRazorpayBookingAction(input: z.infer<typeof confirmSchema>) {
  const parsed = confirmSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, error: "Something's missing from that payment response." };

  const booking = await db.booking.findUnique({ where: { id: parsed.data.bookingId } });
  if (!booking) return { success: false as const, error: "Booking not found." };
  if (booking.paymentStatus === "PAID") {
    return { success: true as const, bookingId: booking.id };
  }
  // See confirmRazorpayPaymentAction in actions/checkout.ts for why this
  // binding check matters — it's the same class/seats-booking flow.
  if (!booking.razorpayOrderId || booking.razorpayOrderId !== parsed.data.razorpayOrderId) {
    return { success: false as const, error: "This payment doesn't match that booking." };
  }

  const provider = getPaymentProvider();
  const result = await provider.verify(parsed.data);
  if (!result.success) {
    return { success: false as const, error: result.reason ?? "Payment verification failed." };
  }

  const updated = await db.booking.update({
    where: { id: booking.id },
    data: { paymentStatus: "PAID", paymentReference: result.reference },
  });

  return { success: true as const, bookingId: updated.id };
}
