import path from "node:path";

import { PrismaClient } from "@/generated/prisma/client";

// A relative sqlite URL ("file:./dev.db") gets resolved against whatever
// directory the calling module happens to live in — which, once Next.js
// has bundled this into route-specific server chunks, is *not* the
// project root. Different routes were silently opening different empty
// databases under .next/server/app/**. Pinning it to an absolute path
// removes the ambiguity; Postgres connection strings (no leading "file:")
// pass through untouched.
function resolvedDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url?.startsWith("file:")) return url;
  const relativePath = url.slice("file:".length);
  const absolutePath = path.resolve(process.cwd(), "prisma", relativePath);
  return `file:${absolutePath}`;
}

// Next.js dev mode hot-reloads modules, which would otherwise open a new
// SQLite connection on every edit. Stashing the client on `globalThis`
// keeps one instance alive across reloads.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient({ datasourceUrl: resolvedDatabaseUrl() });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
