import type { Metadata } from "next";

import { AccountDashboard } from "@/components/account/account-dashboard";
import { LoginForm } from "@/components/account/login-form";
import { Section } from "@/components/layout/section";
import { auth } from "@/lib/auth";
import { getAccountOverview } from "@/lib/data/account";

export const metadata: Metadata = { title: "Your account" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <main id="main">
        <Section className="max-w-lg">
          <LoginForm />
        </Section>
      </main>
    );
  }

  const overview = await getAccountOverview(session.user.id);

  return (
    <main id="main">
      <Section className="max-w-3xl">
        <AccountDashboard overview={overview} />
      </Section>
    </main>
  );
}
