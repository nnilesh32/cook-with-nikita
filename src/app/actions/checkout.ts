"use server";

import { z } from "zod";

import type { Fulfilment, Prisma } from "@/generated/prisma/client";
import { computeBill } from "@/lib/billing";
import {
  getAvailableDates,
  getSlotAvailability,
  hasDailyLimitHeadroom,
  validateCart,
  type CartLineInput,
} from "@/lib/data/checkout";
import { consumeCoupon, revalidateCoupon, validateCoupon } from "@/lib/data/coupons";
import { db } from "@/lib/db";
import { generateOtp, isPhoneVerified, verifyOtp } from "@/lib/otp";
import { type RazorpayCheckoutConfig, getPaymentProvider } from "@/lib/payments";
import { rateLimit } from "@/lib/rate-limit";
import { checkPincode, deliveryFeeFor, MINIMUM_ORDER_VALUE } from "@/lib/serviceability";

// ---------------------------------------------------------------------------
// Small lookups the checkout page needs as the customer moves through it
// ---------------------------------------------------------------------------

export async function getAvailableDatesAction(requiresNextDay: boolean) {
  return getAvailableDates(requiresNextDay);
}

export async function getSlotAvailabilityAction(date: string, fulfilment: Fulfilment) {
  return getSlotAvailability(date, fulfilment);
}

export async function checkPincodeAction(pincode: string) {
  if (!/^\d{6}$/.test(pincode)) {
    return { serviceable: false as const, reason: "Enter a 6-digit pincode." };
  }
  const result = checkPincode(pincode);
  return result.serviceable
    ? { serviceable: true as const, area: result.area, baseFee: result.baseFee }
    : { serviceable: false as const, reason: "I don't deliver there yet — pickup is always available." };
}

export async function validateCartAction(lines: CartLineInput[]) {
  return validateCart(lines);
}

const couponSchema = z.object({
  code: z.string().min(1),
  itemTotal: z.number().int().min(0),
  phone: z.string().optional(),
});

export async function validateCouponAction(input: z.infer<typeof couponSchema>) {
  const parsed = couponSchema.safeParse(input);
  if (!parsed.success) return { valid: false as const, reason: "Enter a code." };
  return validateCoupon(parsed.data.code, parsed.data.itemTotal, parsed.data.phone);
}

// ---------------------------------------------------------------------------
// OTP stub
// ---------------------------------------------------------------------------

const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit phone number");

export async function sendOtpAction(phone: string) {
  const parsed = phoneSchema.safeParse(phone);
  if (!parsed.success) return { success: false as const, error: parsed.error.issues[0].message };

  if (!rateLimit(`otp:${phone}`, 3, 10 * 60 * 1000)) {
    return { success: false as const, error: "Too many codes requested — wait a few minutes and try again." };
  }

  const { code, isDev } = generateOtp(phone);
  return { success: true as const, devCode: isDev ? code : undefined };
}

export async function verifyOtpAction(phone: string, code: string) {
  return verifyOtp(phone, code);
}

// ---------------------------------------------------------------------------
// Order creation — the only place a price becomes real money
// ---------------------------------------------------------------------------

const lineSchema = z.object({
  id: z.string(),
  productId: z.string(),
  variantId: z.string().nullable().optional(),
  addOnIds: z.array(z.string()).optional(),
  spiceLevel: z.number().int().min(1).max(3).nullable().optional(),
  quantity: z.number().int().min(1).max(20),
  unitPrice: z.number().int().min(0),
  name: z.string(),
  note: z.string().max(200).optional(),
});

const addressSchema = z.object({
  line1: z.string().min(3, "Enter your address"),
  line2: z.string().optional(),
  city: z.string().min(2, "Enter your city"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a 6-digit pincode"),
});

const createOrderSchema = z.object({
  lines: z.array(lineSchema).min(1, "Your cart is empty"),
  fulfilment: z.enum(["DELIVERY", "PICKUP"]),
  date: z.string().min(1, "Pick a date"),
  slotId: z.string().min(1, "Pick a time slot"),
  name: z.string().min(2, "Enter your name").max(80),
  phone: phoneSchema,
  address: addressSchema.optional(),
  deliveryNotes: z.string().max(300).optional(),
  couponCode: z.string().optional(),
  paymentMethod: z.enum(["ONLINE", "COD"]),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export type CreateOrderResult =
  | { success: true; orderId: string; orderNumber: string; checkout?: RazorpayCheckoutConfig }
  | { success: false; error: string; field?: string };

class CouponExhaustedError extends Error {
  constructor() {
    super("Coupon ran out of uses");
  }
}

class DailyLimitExceededError extends Error {
  constructor(public productName: string) {
    super("Daily limit exceeded");
  }
}

function buildOrderNumber(now: Date) {
  const yy = now.getFullYear().toString().slice(2);
  const mm = (now.getMonth() + 1).toString().padStart(2, "0");
  const dd = now.getDate().toString().padStart(2, "0");
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `CWN-${yy}${mm}${dd}-${suffix}`;
}

export async function createOrderAction(input: CreateOrderInput): Promise<CreateOrderResult> {
  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { success: false, error: first?.message ?? "Check the form and try again.", field: first?.path.join(".") };
  }
  const data = parsed.data;

  if (!rateLimit(`order:${data.phone}`, 5, 60 * 60 * 1000)) {
    return {
      success: false,
      error: "Too many orders from this number recently — message the kitchen on WhatsApp if you need help.",
    };
  }

  if (data.fulfilment === "DELIVERY" && !data.address) {
    return { success: false, error: "Add a delivery address.", field: "address" };
  }

  // The client only lets you reach this step after verifyOtpAction()
  // succeeds, but that's a UI constraint, not a security one — this
  // action is a public endpoint in its own right, so phone verification
  // has to be re-checked here too, not just trusted from the client.
  if (!isPhoneVerified(data.phone)) {
    return { success: false, error: "Verify your phone number first.", field: "phone" };
  }

  // Re-validate the cart against the database — a client-computed price
  // or quantity never reaches payment unchecked.
  const validations = await validateCart(data.lines);
  const problem = validations.find((v) => !v.ok);
  if (problem) {
    const message =
      problem.issue === "sold_out" || problem.issue === "unavailable"
        ? `${problem.name} is no longer available — remove it and try again.`
        : `Only ${problem.allowedQuantity} of ${problem.name} left today — update the quantity and try again.`;
    return { success: false, error: message };
  }

  const priceChanged = data.lines.find((line) => {
    const check = validations.find((v) => v.id === line.id);
    return check && check.authoritativeUnitPrice !== line.unitPrice;
  });
  if (priceChanged) {
    return { success: false, error: `${priceChanged.name}'s price has changed — refresh your cart and try again.` };
  }

  const itemTotal = data.lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);

  if (data.fulfilment === "DELIVERY" && itemTotal < MINIMUM_ORDER_VALUE) {
    return {
      success: false,
      error: `Delivery orders need a minimum of ₹${MINIMUM_ORDER_VALUE} — add a little more to your cart, or switch to pickup.`,
    };
  }

  let deliveryFee = 0;
  if (data.fulfilment === "DELIVERY") {
    const fee = deliveryFeeFor(data.address!.pincode, itemTotal);
    if (fee === null) {
      return {
        success: false,
        error: "I don't deliver to that pincode yet — pickup is always available.",
        field: "address.pincode",
      };
    }
    deliveryFee = fee;
  }

  const slots = await getSlotAvailability(data.date, data.fulfilment);
  const slot = slots.find((s) => s.id === data.slotId);
  if (!slot || slot.remaining <= 0) {
    return { success: false, error: "That slot just filled up — pick another time.", field: "slotId" };
  }

  let discountAmount = 0;
  let couponId: string | undefined;
  let couponMaxUses: number | null = null;
  let couponCode: string | undefined;
  if (data.couponCode) {
    const couponResult = await revalidateCoupon(data.couponCode, itemTotal, data.phone);
    if (!couponResult.valid) {
      return { success: false, error: couponResult.reason, field: "couponCode" };
    }
    discountAmount = couponResult.coupon.discountAmount;
    if (couponResult.coupon.freeDelivery) deliveryFee = 0;
    // Not consumed yet — validateCoupon above only reads. The actual
    // usedCount increment happens atomically inside the transaction
    // below, alongside the order it belongs to.
    const couponRow = await db.coupon.findUnique({ where: { code: couponResult.coupon.code } });
    couponId = couponRow?.id;
    couponMaxUses = couponRow?.maxUses ?? null;
    couponCode = couponResult.coupon.code;
  }

  const bill = computeBill({
    itemTotal,
    deliveryFee,
    discountAmount,
    isPickup: data.fulfilment === "PICKUP",
  });

  // Resolve add-on names/prices for each line up front, so OrderItemOption
  // rows carry a real snapshot rather than just an id. Also collect the
  // dailyLimit lines separately — they get one more, atomic check inside
  // the transaction below, right before the order actually commits.
  const orderItemsData: Prisma.OrderItemUncheckedCreateWithoutOrderInput[] = [];
  const dailyLimitChecks: { productId: string; name: string; dailyLimit: number; quantity: number }[] = [];
  for (const line of data.lines) {
    const product = await db.product.findUniqueOrThrow({
      where: { id: line.productId },
      include: { addOns: true },
    });
    const addOns = product.addOns.filter((a) => line.addOnIds?.includes(a.id));
    orderItemsData.push({
      productId: line.productId,
      variantId: line.variantId ?? undefined,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      spiceLevel: line.spiceLevel ?? null,
      specialInstructions: line.note,
      options: addOns.length
        ? { create: addOns.map((a) => ({ addOnId: a.id, label: a.name, priceDelta: a.price })) }
        : undefined,
    });
    if (product.dailyLimit != null) {
      dailyLimitChecks.push({
        productId: product.id,
        name: product.name,
        dailyLimit: product.dailyLimit,
        quantity: line.quantity,
      });
    }
  }

  const customer = await db.customer.upsert({
    where: { phone: data.phone },
    update: { name: data.name },
    create: { name: data.name, phone: data.phone },
  });

  const now = new Date();

  // Address creation, the daily-limit re-check, the order row, and the
  // coupon's usedCount increment all happen in one transaction: if a
  // dish's last portions or the coupon's last use gets taken by a
  // concurrent order between the read-only checks above and here, or
  // anything else in this block fails, the whole thing rolls back
  // together — never an order that oversells a limit, and never a
  // consumed coupon use with no order to show for it.
  let order;
  try {
    order = await db.$transaction(async (tx) => {
      for (const check of dailyLimitChecks) {
        const available = await hasDailyLimitHeadroom(tx, check.productId, check.dailyLimit, check.quantity);
        if (!available) {
          throw new DailyLimitExceededError(check.name);
        }
      }

      let addressId: string | undefined;
      if (data.fulfilment === "DELIVERY" && data.address) {
        const address = await tx.address.create({
          data: {
            customerId: customer.id,
            label: "Delivery address",
            line1: data.address.line1,
            line2: data.address.line2,
            city: data.address.city,
            pincode: data.address.pincode,
          },
        });
        addressId = address.id;
      }

      if (couponCode) {
        const consumeResult = await consumeCoupon(tx, couponCode, couponMaxUses);
        if (!consumeResult.consumed) {
          throw new CouponExhaustedError();
        }
      }

      return tx.order.create({
        data: {
          orderNumber: buildOrderNumber(now),
          customerId: customer.id,
          guestName: data.name,
          guestPhone: data.phone,
          fulfilment: data.fulfilment,
          addressId,
          pincode: data.fulfilment === "DELIVERY" ? data.address!.pincode : null,
          scheduledDate: data.date,
          slotId: data.slotId,
          status: "RECEIVED",
          deliveryNotes: data.deliveryNotes,
          itemTotal: bill.itemTotal,
          packagingFee: bill.packagingFee,
          deliveryFee: bill.deliveryFee,
          discountAmount: bill.discountAmount,
          gstAmount: bill.gstAmount,
          grandTotal: bill.grandTotal,
          couponId,
          paymentMethod: data.paymentMethod === "COD" ? "COD" : "MOCK",
          paymentStatus: "PENDING",
          items: { create: orderItemsData },
        },
      });
    });
  } catch (error) {
    if (error instanceof CouponExhaustedError) {
      return { success: false, error: "That code just ran out — remove it and try again.", field: "couponCode" };
    }
    if (error instanceof DailyLimitExceededError) {
      return {
        success: false,
        error: `${error.productName} just sold out — update the quantity and try again.`,
      };
    }
    throw error;
  }

  if (data.paymentMethod === "COD") {
    return { success: true, orderId: order.id, orderNumber: order.orderNumber };
  }

  const provider = getPaymentProvider();
  const chargeResult = await provider.charge({
    orderId: order.id,
    orderNumber: order.orderNumber,
    amountInRupees: bill.grandTotal,
    customerName: data.name,
    customerPhone: data.phone,
  });

  if (chargeResult.status === "paid") {
    // The only way charge() resolves "paid" synchronously is MockProvider
    // (directly, or via RazorpayProvider's unconfigured-fallback) — a
    // configured RazorpayProvider always returns "requires_client_action"
    // below, since a real charge needs the checkout-modal round trip.
    // `provider.id` reflects which *wrapper* is in use, not which one
    // actually processed the charge, so it can't be used here.
    await db.order.update({
      where: { id: order.id },
      data: {
        paymentMethod: "MOCK",
        paymentStatus: "PAID",
        paymentReference: chargeResult.reference,
      },
    });
    return { success: true, orderId: order.id, orderNumber: order.orderNumber };
  }

  if (chargeResult.status === "requires_client_action") {
    // Bind this order to the specific Razorpay order id issued for it,
    // so confirmRazorpayPaymentAction can reject a signature that's
    // genuinely valid but was issued for a *different* order.
    await db.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: chargeResult.checkout.razorpayOrderId },
    });
    return { success: true, orderId: order.id, orderNumber: order.orderNumber, checkout: chargeResult.checkout };
  }

  return {
    success: false,
    error: `Payment failed: ${chargeResult.reason}. Your order was saved as unpaid — try again from your order page, or message the kitchen.`,
  };
}

const confirmSchema = z.object({
  orderId: z.string(),
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});

export async function confirmRazorpayPaymentAction(input: z.infer<typeof confirmSchema>) {
  const parsed = confirmSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, error: "Something's missing from that payment response." };

  const order = await db.order.findUnique({ where: { id: parsed.data.orderId } });
  if (!order) return { success: false as const, error: "Order not found." };
  if (order.paymentStatus === "PAID") {
    return { success: true as const, orderId: order.id, orderNumber: order.orderNumber };
  }
  // Every order that legitimately reaches this action was bound to a
  // specific Razorpay order id when it was created (see
  // createOrderAction's "requires_client_action" branch). Checking it
  // here stops two separate exploits: a genuinely-valid signature for a
  // *different* order being replayed against this one, and — since
  // Mock-fallback orders never get a razorpayOrderId — an unconfigured
  // MockProvider.verify() (which accepts anything) rubber-stamping a
  // fabricated confirmation for an order that was never actually
  // handed off to Razorpay's checkout flow.
  if (!order.razorpayOrderId || order.razorpayOrderId !== parsed.data.razorpayOrderId) {
    return { success: false as const, error: "This payment doesn't match that order." };
  }

  const provider = getPaymentProvider();
  const result = await provider.verify(parsed.data);
  if (!result.success) {
    return { success: false as const, error: result.reason ?? "Payment verification failed." };
  }

  const updated = await db.order.update({
    where: { id: order.id },
    data: { paymentStatus: "PAID", paymentMethod: "RAZORPAY", paymentReference: result.reference },
  });

  return { success: true as const, orderId: updated.id, orderNumber: updated.orderNumber };
}
