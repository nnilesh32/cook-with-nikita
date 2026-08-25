"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const newsletterSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email")
    .email("That doesn't look like an email"),
});

type NewsletterValues = z.infer<typeof newsletterSchema>;

export function NewsletterForm({ className }: { className?: string }) {
  const form = useForm<NewsletterValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: NewsletterValues) {
    // Stubbed until the Prisma schema lands (phase 3) — swaps for a
    // server action that writes to NewsletterSignup and rate-limits by IP.
    await new Promise((resolve) => setTimeout(resolve, 500));
    void values;
    toast.success("You're on the list — new dishes land in your inbox first.");
    form.reset();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className={className}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    aria-label="Email address"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Joining…" : "Join the list"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
