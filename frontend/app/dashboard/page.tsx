"use client";

import Link from "next/link";
import { Globe, Bot, Clock, Plus, MessageSquare } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/dashboard/StatCard";
import { WebsiteCard } from "@/components/dashboard/WebsiteCard";
import { Button } from "@/components/ui/Button";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui/Feedback";
import { useAuth } from "@/hooks/useAuth";
import { useAsync } from "@/hooks/useAsync";
import { websitesApi } from "@/lib/api";
import { getWebsiteId, type Website } from "@/types";

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useAsync(
    () => websitesApi.list(),
    []
  );

  const websites: Website[] = data?.websites ?? [];

  const active = websites.filter(
    (w) => w.status === "APPROVED" && w.widgetStatus === "INSTALLED"
  ).length;
  const pending = websites.filter((w) => w.status === "PENDING").length;
  const indexed = websites.filter((w) => w.indexingStatus === "INDEXED").length;

  return (
    <>
      <Header
        title="Overview"
        description="Manage your websites and AI chatbots."
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
            Welcome back, {user?.name.split(" ")[0] ?? "there"}
          </h2>
          <p className="mt-1 text-[13.5px] text-ink-500">
            Manage your websites and AI chatbots.
          </p>
        </div>

        {error && <ErrorState message={error} onRetry={refetch} />}

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
            caption="Approved + widget installed"
          />
          <StatCard
            label="Indexed"
            value={indexed}
            icon={Clock}
            caption="Ready to answer questions"
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

          {loading ? (
            <LoadingState label="Loading your websites…" />
          ) : websites.length === 0 ? (
            <EmptyWebsites />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {websites.slice(0, 6).map((w) => (
                <WebsiteCard key={getWebsiteId(w)} website={w} />
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
    <EmptyState
      icon={<MessageSquare size={18} strokeWidth={2} />}
      title="No websites yet"
      description="Submit your first website to get a Scrappy chatbot up and running in minutes."
      action={
        <Link href="/dashboard/websites/new">
          <Button leftIcon={<Plus size={15} strokeWidth={2.4} />}>
            Add Website
          </Button>
        </Link>
      }
    />
  );
}