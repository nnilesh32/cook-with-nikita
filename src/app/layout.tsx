import type { Metadata } from "next";
import { Bricolage_Grotesque, Karla, Space_Mono } from "next/font/google";

import { SiteChrome } from "@/components/layout/site-chrome";
import { SessionProvider } from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/sonner";
import { SITE_URL } from "@/lib/site";
import { restaurantJsonLd } from "@/lib/structured-data";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
});

const karla = Karla({
  variable: "--font-body",
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Cook with Nikita — home-cooked food, cooking classes & catering",
    template: "%s — Cook with Nikita",
  },
  description:
    "I cook everything the morning it goes out. Order home-style curries, biryani and sweets for delivery or pickup, book a hands-on cooking class, or bring me in for your next event.",
  openGraph: {
    type: "website",
    siteName: "Cook with Nikita",
    title: "Cook with Nikita — home-cooked food, cooking classes & catering",
    description:
      "I cook everything the morning it goes out. Order home-style curries, biryani and sweets for delivery or pickup, book a hands-on cooking class, or bring me in for your next event.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${karla.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-bone text-ink font-body">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd()) }}
        />
        <a
          href="#main"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-2 focus-visible:left-2 focus-visible:z-50 focus-visible:rounded-md focus-visible:bg-ink focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:text-bone"
        >
          Skip to content
        </a>
        <SessionProvider>
          <SiteChrome>{children}</SiteChrome>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
