import Link from "next/link";
import { Menu, User } from "lucide-react";

import { CartSheet } from "@/components/cart/cart-sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const primaryNav = [
  { href: "/menu", label: "Menu" },
  { href: "/classes", label: "Classes" },
  { href: "/catering", label: "Catering" },
  { href: "/shop", label: "Shop" },
  { href: "/recipes", label: "Recipes" },
  { href: "/about", label: "About" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-steel/50 bg-bone/90 backdrop-blur supports-backdrop-filter:bg-bone/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link
          href="/"
          className="font-display text-lg font-medium tracking-tight text-ink"
        >
          Cook with Nikita
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-ink/70 transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:inline-flex"
            aria-label="Your account"
            render={<Link href="/account" />}
          >
            <User className="size-5" />
          </Button>

          <CartSheet />

          <Button
            size="lg"
            className="hidden lg:inline-flex"
            render={<Link href="/menu" />}
          >
            Order now
          </Button>

          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Open menu"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="flex w-full sm:max-w-xs">
              <SheetHeader className="border-b border-steel/40">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>

              <nav
                aria-label="Mobile primary"
                className="flex flex-col gap-1 px-2"
              >
                {primaryNav.map((item) => (
                  <SheetClose
                    key={item.href}
                    nativeButton={false}
                    render={<Link href={item.href} />}
                    className="rounded-lg px-3 py-2.5 text-sm text-ink transition-colors hover:bg-muted"
                  >
                    {item.label}
                  </SheetClose>
                ))}
                <SheetClose
                  nativeButton={false}
                  render={<Link href="/account" />}
                  className="rounded-lg px-3 py-2.5 text-sm text-ink transition-colors hover:bg-muted"
                >
                  Account
                </SheetClose>
              </nav>

              <div className="mt-auto p-4">
                <SheetClose
                  nativeButton={false}
                  render={<Link href="/menu" />}
                  className={cn(buttonVariants({ size: "lg" }), "w-full")}
                >
                  Order now
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
