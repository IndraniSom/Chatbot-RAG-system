"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

/**
 * Wraps any dashboard/admin route subtree. Redirects to /login when the
 * auth status resolves to "unauthenticated".
 *
 * While we're still resolving the initial token ("loading"), we render a
 * minimal skeleton so the page doesn't flash to the login screen.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [status, router, pathname]);

  if (status === "loading") {
    return <AuthSkeleton />;
  }

  if (status === "unauthenticated") {
    return <AuthSkeleton />;
  }

  return <>{children}</>;
}

function AuthSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50">
      <div className="flex items-center gap-2 text-[13px] text-ink-500">
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ink-300 border-r-transparent" />
        Loading…
      </div>
    </div>
  );
}