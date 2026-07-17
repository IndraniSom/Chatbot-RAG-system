import Link from "next/link";
import { Logo } from "@/components/Logo";

interface AuthShellProps {
  heading: string;
  description: string;
  children: React.ReactNode;
  /** Content for the bottom helper line. */
  footer: React.ReactNode;
}

/**
 * Centered card layout shared by /login and /signup. Keeps both pages
 * pixel-identical and avoids duplicated chrome.
 */
export function AuthShell({
  heading,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink-50 px-4 py-12">
      <div className="mb-8">
        <Link href="/" aria-label="Scrappy home">
          <Logo size="lg" />
        </Link>
      </div>
      <div className="w-full max-w-[420px] rounded-2xl border border-ink-200 bg-white p-8 shadow-soft">
        <div className="mb-6 text-center">
          <h1 className="text-[22px] font-semibold tracking-tight text-ink-900">
            {heading}
          </h1>
          <p className="mt-1.5 text-[13.5px] text-ink-500">{description}</p>
        </div>
        {children}
      </div>
      <div className="mt-6 text-[13px] text-ink-500">{footer}</div>
    </div>
  );
}
