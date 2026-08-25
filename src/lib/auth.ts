import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { db } from "@/lib/db";
import { verifyOtp } from "@/lib/otp";

/**
 * Customer accounts — a phone + OTP-stub credentials provider, not
 * email/password. There's no real SMS gateway wired up (see lib/otp.ts),
 * so this is functionally identical to checkout's phone verification,
 * just producing a signed-in session instead of a one-time check.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Phone",
      credentials: {
        phone: { label: "Phone", type: "text" },
        otp: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        const phone = typeof credentials?.phone === "string" ? credentials.phone : undefined;
        const otp = typeof credentials?.otp === "string" ? credentials.otp : undefined;
        if (!phone || !otp || !/^[6-9]\d{9}$/.test(phone)) return null;

        const result = verifyOtp(phone, otp);
        if (!result.success) return null;

        const customer = await db.customer.upsert({
          where: { phone },
          update: {},
          create: { name: phone, phone },
        });

        return { id: customer.id, name: customer.name, phone: customer.phone };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.customerId = user.id;
        token.phone = user.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.customerId) session.user.id = token.customerId;
      if (token.phone) session.user.phone = token.phone;
      return session;
    },
  },
});
