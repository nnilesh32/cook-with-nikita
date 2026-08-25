"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { adminLoginAction } from "@/app/actions/admin-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await adminLoginAction(password);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push("/admin/orders");
      router.refresh();
    });
  }

  return (
    <main id="main" className="flex min-h-screen items-center justify-center bg-ink px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-bone/10 bg-bone/5 p-8 backdrop-blur"
      >
        <p className="font-mono text-xs tracking-wide text-turmeric uppercase">Admin</p>
        <h1 className="mt-2 text-2xl font-medium text-bone">Kitchen dashboard</h1>
        <p className="mt-2 text-sm text-bone/50">Password-protected — for Nikita only.</p>

        <div className="mt-6 flex flex-col gap-1.5">
          <Label htmlFor="admin-password" className="text-bone/70">
            Password
          </Label>
          <Input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-bone/20 bg-bone/10 text-bone placeholder:text-bone/30"
            autoFocus
          />
        </div>

        {error && <p className="mt-3 text-xs text-kashmiri">{error}</p>}

        <Button type="submit" size="lg" className="mt-6 w-full" disabled={!password || pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </main>
  );
}
