"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, Lock, User, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirm?: string;
  }>({});

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Please enter your name.";
    if (!email.includes("@")) next.email = "Please enter a valid email.";
    if (password.length < 8)
      next.password = "Password must be at least 8 characters.";
    if (confirm !== password) next.confirm = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    window.setTimeout(() => router.push("/dashboard"), 400);
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Input
        label="Full name"
        type="text"
        name="name"
        autoComplete="name"
        placeholder="Alex Johnson"
        value={name}
        onChange={(e) => setName(e.target.value)}
        leftIcon={<User size={15} strokeWidth={2} />}
        error={errors.name}
        required
      />
      <Input
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        leftIcon={<Mail size={15} strokeWidth={2} />}
        error={errors.email}
        required
      />
      <Input
        label="Password"
        type="password"
        name="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        leftIcon={<Lock size={15} strokeWidth={2} />}
        hint="Use 8+ characters with letters and numbers."
        error={errors.password}
        required
      />
      <Input
        label="Confirm password"
        type="password"
        name="confirm"
        autoComplete="new-password"
        placeholder="Repeat your password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        leftIcon={<Check size={15} strokeWidth={2} />}
        error={errors.confirm}
        required
      />
      <Button
        type="submit"
        size="lg"
        fullWidth
        loading={loading}
        rightIcon={<ArrowRight size={15} strokeWidth={2.4} />}
      >
        Create Account
      </Button>
    </form>
  );
}
