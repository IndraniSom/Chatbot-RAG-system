"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { WebsiteCard } from "@/components/dashboard/WebsiteCard";
import { Button } from "@/components/ui/Button";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui/Feedback";
import { useAsync } from "@/hooks/useAsync";
import { websitesApi } from "@/lib/api";
import type { Website } from "@/types";

export default function MyWebsitesPage() {
  const { data, loading, error, refetch } = useAsync(
    () => websitesApi.list(),
    []
  );

  const websites: Website[] = data?.websites ?? [];

  return (
    <>
      <Header
        title="My Websites"
        description="Every website you've connected to Scrappy."
        actions={
          <Link href="/dashboard/websites/new">
            <Button leftIcon={<Plus size={15} strokeWidth={2.4} />}>
              Add Website
            </Button>
          </Link>
        }
      />
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {error && <ErrorState message={error} onRetry={refetch} />}

        <div className="flex items-center justify-between">
          <p className="text-[13px] text-ink-500">
            {websites.length}{" "}
            {websites.length === 1 ? "website" : "websites"}
          </p>
        </div>

        {loading ? (
          <LoadingState />
        ) : websites.length === 0 ? (
          <EmptyState
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
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {websites.map((w) => (
              <WebsiteCard key={w.id} website={w} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}