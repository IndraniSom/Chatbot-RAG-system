import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <AuthShell
      heading="Create your Scrappy account"
      description="Add an AI assistant to your website in minutes."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-ink-900 underline-offset-2 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
