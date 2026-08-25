import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      phone: string;
    } & DefaultSession["user"];
  }
  interface User {
    phone: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    customerId?: string;
    phone?: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    customerId?: string;
    phone?: string;
  }
}
