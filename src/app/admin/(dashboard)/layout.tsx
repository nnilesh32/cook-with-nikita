import { LogOut } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { adminLogoutAction } from "@/app/actions/admin-auth";
import { NewOrderWatcher } from "@/components/admin/new-order-watcher";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getReceivedOrderCount } from "@/lib/data/admin";

const NAV = [
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/menu", label: "Menu" },
  { href: "/admin/classes", label: "Classes & slots" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/reports", label: "Reports" },
] as const;

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const receivedCount = await getReceivedOrderCount();

  return (
    <div className="min-h-screen bg-bone">
      <NewOrderWatcher initialCount={receivedCount} />
      <header className="border-b border-steel/50 bg-ink">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/admin/orders" className="font-display text-sm font-medium tracking-tight text-bone">
              Cook with Nikita <span className="text-bone/40">/ admin</span>
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-bone/60 transition-colors hover:text-bone"
                >
                  {item.label}
                  {item.href === "/admin/orders" && receivedCount > 0 && (
                    <span className="ml-1.5 inline-flex size-4 items-center justify-center rounded-full bg-turmeric text-[0.65rem] font-medium text-ink">
                      {receivedCount}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
          <form action={adminLogoutAction}>
            <button
              type="submit"
              className="flex items-center gap-1.5 text-xs text-bone/50 transition-colors hover:text-bone"
            >
              <LogOut className="size-3.5" />
              Sign out
            </button>
          </form>
        </div>
        <nav className="flex gap-4 overflow-x-auto border-t border-bone/10 px-6 py-2 md:hidden">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="shrink-0 text-xs text-bone/60 hover:text-bone">
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main id="main" className="mx-auto max-w-7xl px-6 py-10 lg:px-8">{children}</main>
    </div>
  );
}
