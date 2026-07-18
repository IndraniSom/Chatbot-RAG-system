import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

// useSearchParams() inside LoginForm needs a Suspense boundary at build
// time, otherwise Next 14's static prerender bail-out fails.
export default function LoginPage() {
  return (
    <AuthShell
      heading="Welcome back"
      description="Sign in to manage your AI chatbots."
      footer={
        <>
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-ink-900 underline-offset-2 hover:underline"
          >
            Create account
          </Link>
        </>
      }
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
