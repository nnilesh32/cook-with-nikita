"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createOrderAction, validateCartAction, type CreateOrderInput } from "@/app/actions/checkout";
import {
  checkoutSchema,
  STEP_FIELDS,
  STEP_LABELS,
  type CheckoutValues,
} from "@/components/checkout/checkout-schema";
import { OrderSummary } from "@/components/checkout/order-summary";
import { RazorpayCheckoutButton } from "@/components/checkout/razorpay-checkout-button";
import { StepDetails } from "@/components/checkout/step-details";
import { StepFulfilment } from "@/components/checkout/step-fulfilment";
import { StepPayment } from "@/components/checkout/step-payment";
import { StepSchedule } from "@/components/checkout/step-schedule";
import { Button } from "@/components/ui/button";
import { computeBill } from "@/lib/billing";
import { formatINR } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { deliveryFeeFor } from "@/lib/serviceability";
import type { RazorpayCheckoutConfig } from "@/lib/payments";
import { useCartStore, useCartSubtotal } from "@/stores/cart-store";

export function CheckoutFlow() {
  const router = useRouter();
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const lines = useCartStore((state) => state.lines);
  const coupon = useCartStore((state) => state.coupon);
  const clearCart = useCartStore((state) => state.clear);
  const subtotal = useCartSubtotal();

  const [step, setStep] = useState(1);
  const [requiresNextDay, setRequiresNextDay] = useState(false);
  const [cartChecked, setCartChecked] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<{
    orderId: string;
    orderNumber: string;
    checkout: RazorpayCheckoutConfig;
  } | null>(null);

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fulfilment: "DELIVERY",
      date: "",
      slotId: "",
      name: "",
      phone: "",
      otpVerified: false,
      line1: "",
      line2: "",
      city: "",
      pincode: "",
      deliveryNotes: "",
      paymentMethod: "ONLINE",
    },
  });

  const fulfilment = form.watch("fulfilment");
  const pincode = form.watch("pincode");

  // Catch a stale cart (sold out, price changed since it was added) up
  // front, before the customer sinks time into the rest of the form —
  // it's re-checked authoritatively again at order creation regardless.
  useEffect(() => {
    if (!hasHydrated || lines.length === 0) return;
    validateCartAction(
      lines.map((l) => ({ id: l.id, productId: l.productId, variantId: l.variantId, addOnIds: l.addOnIds, quantity: l.quantity }))
    ).then((results) => {
      setRequiresNextDay(results.some((r) => r.leadTimeHours >= 24));
      const problem = results.find((r) => !r.ok);
      if (problem) {
        toast.warning(
          problem.issue === "sold_out" || problem.issue === "unavailable"
            ? `${problem.name} isn't available anymore — remove it from your cart.`
            : `Only ${problem.allowedQuantity} of ${problem.name} left today.`
        );
      }
      setCartChecked(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated]);

  const deliveryFee = fulfilment === "PICKUP" ? 0 : (deliveryFeeFor(pincode ?? "", subtotal) ?? 0);
  const deliveryKnown = fulfilment === "PICKUP" || (Boolean(pincode) && /^\d{6}$/.test(pincode ?? "") && deliveryFeeFor(pincode!, subtotal) !== null);
  const bill = computeBill({
    itemTotal: subtotal,
    deliveryFee,
    discountAmount: coupon?.discountAmount ?? 0,
    isPickup: fulfilment === "PICKUP",
  });

  async function handleContinue() {
    const fields = STEP_FIELDS[step];
    const valid = await form.trigger(fields);
    if (!valid) return;
    setStep((s) => Math.min(s + 1, 4));
  }

  async function handlePlaceOrder() {
    const valid = await form.trigger();
    if (!valid) return;

    setSubmitError(null);
    setIsSubmitting(true);

    const values = form.getValues();
    const input: CreateOrderInput = {
      lines: lines.map((l) => ({
        id: l.id,
        productId: l.productId,
        variantId: l.variantId ?? null,
        addOnIds: l.addOnIds ?? [],
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        name: l.name,
        note: l.note,
      })),
      fulfilment: values.fulfilment,
      date: values.date,
      slotId: values.slotId,
      name: values.name,
      phone: values.phone,
      address:
        values.fulfilment === "DELIVERY"
          ? { line1: values.line1 ?? "", line2: values.line2, city: values.city ?? "", pincode: values.pincode ?? "" }
          : undefined,
      deliveryNotes: values.deliveryNotes,
      couponCode: coupon?.code,
      paymentMethod: values.paymentMethod,
    };

    const result = await createOrderAction(input);
    setIsSubmitting(false);

    if (!result.success) {
      setSubmitError(result.error);
      toast.error(result.error);
      return;
    }

    if (result.checkout) {
      setPendingPayment({ orderId: result.orderId, orderNumber: result.orderNumber, checkout: result.checkout });
      return;
    }

    setIsRedirecting(true);
    router.push(`/order/${result.orderId}/confirmation`);
    clearCart();
  }

  if (!hasHydrated) return null;

  if (lines.length === 0 && !isRedirecting) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-steel/60 py-24 text-center">
        <p className="text-lg font-medium text-ink">There&apos;s nothing to check out yet.</p>
        <Button size="lg" className="mt-2" render={<Link href="/menu" />}>
          Browse the menu
        </Button>
      </div>
    );
  }

  if (pendingPayment) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-4 rounded-2xl border border-steel/50 bg-card p-6 text-center">
        <p className="font-medium text-ink">Order {pendingPayment.orderNumber} is saved — now let&apos;s take payment.</p>
        <RazorpayCheckoutButton
          orderId={pendingPayment.orderId}
          orderNumber={pendingPayment.orderNumber}
          checkout={pendingPayment.checkout}
          onVerified={({ orderId }) => {
            setIsRedirecting(true);
            router.push(`/order/${orderId}/confirmation`);
            clearCart();
          }}
          onError={(message) => {
            toast.error(message);
            setSubmitError(message);
          }}
        />
        {submitError && <p className="text-xs text-kashmiri">{submitError}</p>}
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <div>
        <ol className="mb-8 flex items-center gap-2 font-mono text-xs text-ink/50">
          {STEP_LABELS.map((label, i) => {
            const n = i + 1;
            return (
              <li key={label} className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full border",
                    n === step
                      ? "border-turmeric bg-turmeric text-ink"
                      : n < step
                        ? "border-coriander bg-coriander/15 text-coriander"
                        : "border-steel/50 text-ink/40"
                  )}
                >
                  {n}
                </span>
                <span className={n === step ? "text-ink" : ""}>{label}</span>
                {n < 4 && <span className="mx-1 text-steel">—</span>}
              </li>
            );
          })}
        </ol>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="rounded-2xl border border-steel/50 bg-card p-6"
        >
          {step === 1 && <StepFulfilment form={form} />}
          {step === 2 && <StepSchedule form={form} requiresNextDay={requiresNextDay} />}
          {step === 3 && <StepDetails form={form} />}
          {step === 4 && <StepPayment form={form} />}

          {submitError && step === 4 && <p className="mt-4 text-sm text-kashmiri">{submitError}</p>}

          <div className="mt-8 flex items-center justify-between border-t border-steel/40 pt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep((s) => Math.max(s - 1, 1))}
              className={step === 1 ? "invisible" : ""}
            >
              Back
            </Button>
            {step < 4 ? (
              <Button type="button" size="lg" onClick={handleContinue}>
                Continue
              </Button>
            ) : (
              <div className="flex flex-col items-end gap-1.5">
                <Button
                  type="button"
                  size="xl"
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting || !cartChecked || !deliveryKnown}
                >
                  {isSubmitting
                    ? "Placing order…"
                    : deliveryKnown
                      ? `Place order — ${formatINR(bill.grandTotal)}`
                      : "Place order"}
                </Button>
                {/* deliveryKnown only turns false here if the pincode
                    entered back in step 3 passed shape validation but
                    isn't actually one of the serviceable ones — real,
                    if rare, since that step only checks the format. */}
                {!deliveryKnown && (
                  <p className="text-xs text-kashmiri">
                    That pincode isn&apos;t in my delivery area — go back and switch to pickup, or use a
                    different address.
                  </p>
                )}
              </div>
            )}
          </div>
        </form>
      </div>

      <div className="lg:sticky lg:top-24 lg:h-fit">
        <OrderSummary bill={bill} deliveryKnown={deliveryKnown} />
      </div>
    </div>
  );
}
