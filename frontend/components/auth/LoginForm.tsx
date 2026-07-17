"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.includes("@") || !password) {
      setError("Please enter a valid email and password.");
      return;
    }
    setLoading(true);
    // Mock auth: route to dashboard
    window.setTimeout(() => router.push("/dashboard"), 400);
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Input
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        leftIcon={<Mail size={15} strokeWidth={2} />}
        required
      />
      <Input
        label="Password"
        type="password"
        name="password"
        autoComplete="current-password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        leftIcon={<Lock size={15} strokeWidth={2} />}
        required
        error={error ?? undefined}
      />
      <Button
        type="submit"
        size="lg"
        fullWidth
        loading={loading}
        rightIcon={<ArrowRight size={15} strokeWidth={2.4} />}
      >
        Sign In
      </Button>
    </form>
  );
}
