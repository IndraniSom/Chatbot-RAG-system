import Link from "next/link";
import { ArrowLeft, Send, ShieldCheck, Code2, type LucideIcon } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { AddWebsiteForm } from "@/components/dashboard/AddWebsiteForm";
import { currentUser } from "@/lib/mock-data";

export default function AddWebsitePage() {
  return (
    <>
      <Header
        title="Add a new website"
        description="Submit your website for approval before installing Scrappy."
        user={currentUser}
      />
      <div className="mx-auto w-full max-w-2xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/dashboard/websites"
          className="inline-flex items-center gap-1 text-[12.5px] font-medium text-ink-500 hover:text-ink-900"
        >
          <ArrowLeft size={13} strokeWidth={2.4} />
          Back to websites
        </Link>

        <Card>
          <h2 className="text-[18px] font-semibold tracking-tight text-ink-900">
            Website details
          </h2>
          <p className="mt-1 text-[13px] text-ink-500">
            We'll review your submission and approve it within one business day.
          </p>
          <div className="mt-6">
            <AddWebsiteForm />
          </div>
        </Card>

        <section aria-label="How it works">
          <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-ink-400">
            How it works
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Step
              n={1}
              icon={Send}
              title="Submit your website"
              description="Add your website's name and URL."
            />
            <Step
              n={2}
              icon={ShieldCheck}
              title="Wait for admin approval"
              description="Our team reviews every submission within a business day."
            />
            <Step
              n={3}
              icon={Code2}
              title="Install the Scrappy script"
              description="Paste one line of code before your closing body tag."
            />
          </div>
        </section>
      </div>
    </>
  );
}

function Step({
  n,
  icon: Icon,
  title,
  description,
}: {
  n: number;
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-900 text-[11px] font-semibold text-white">
          {n}
        </span>
        <Icon size={14} strokeWidth={2.2} />
      </div>
      <p className="text-[13.5px] font-semibold text-ink-900">{title}</p>
      <p className="mt-1 text-[12.5px] leading-relaxed text-ink-500">
        {description}
      </p>
    </div>
  );
}
