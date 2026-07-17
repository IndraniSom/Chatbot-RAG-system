import Link from "next/link";
import { Globe, Bot, Clock, Plus, MessageSquare } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/dashboard/StatCard";
import { WebsiteCard } from "@/components/dashboard/WebsiteCard";
import { Button } from "@/components/ui/Button";
import { currentUser, getUserWebsites } from "@/lib/mock-data";

export default function DashboardOverviewPage() {
  const websites = getUserWebsites(currentUser.id);
  const active = websites.filter((w) => w.widgetStatus === "INSTALLED").length;
  const pending = websites.filter((w) => w.status === "PENDING").length;

  return (
    <>
      <Header
        title="Overview"
        description="Manage your websites and AI chatbots."
        user={currentUser}
        actions={
          <Link href="/dashboard/websites/new">
            <Button leftIcon={<Plus size={15} strokeWidth={2.4} />}>
              Add Website
            </Button>
          </Link>
        }
      />
      <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Greeting */}
        <div>
          <h2 className="text-[20px] font-semibold tracking-tight text-ink-900">
            Welcome back, {currentUser.name.split(" ")[0]}
          </h2>
          <p className="mt-1 text-[13.5px] text-ink-500">
            Manage your websites and AI chatbots.
          </p>
        </div>

        {/* Stats */}
        <section
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
          aria-label="Summary statistics"
        >
          <StatCard
            label="Total Websites"
            value={websites.length}
            icon={Globe}
          />
          <StatCard
            label="Active Chatbots"
            value={active}
            icon={Bot}
            caption="Across all websites"
          />
          <StatCard
            label="Pending Approval"
            value={pending}
            icon={Clock}
            caption="Awaiting admin review"
          />
        </section>

        {/* My websites */}
        <section aria-label="My websites">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h3 className="text-[15px] font-semibold text-ink-900">
                My Websites
              </h3>
              <p className="mt-0.5 text-[12.5px] text-ink-500">
                {websites.length}{" "}
                {websites.length === 1 ? "website" : "websites"} connected to
                Scrappy
              </p>
            </div>
            <Link
              href="/dashboard/websites"
              className="text-[12.5px] font-medium text-ink-700 hover:text-ink-900"
            >
              View all
            </Link>
          </div>

          {websites.length === 0 ? (
            <EmptyWebsites />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {websites.map((w) => (
                <WebsiteCard key={w.id} website={w} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function EmptyWebsites() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-white px-6 py-16 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-ink-50 text-ink-700">
        <MessageSquare size={18} strokeWidth={2} />
      </div>
      <h4 className="text-[14px] font-semibold text-ink-900">No websites yet</h4>
      <p className="mt-1 max-w-sm text-[13px] text-ink-500">
        Submit your first website to get a Scrappy chatbot up and running in
        minutes.
      </p>
      <Link href="/dashboard/websites/new" className="mt-4">
        <Button leftIcon={<Plus size={15} strokeWidth={2.4} />}>
          Add Website
        </Button>
      </Link>
    </div>
  );
}
