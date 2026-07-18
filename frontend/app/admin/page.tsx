"use client";

import { Users, Globe, Clock, Bot } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/dashboard/StatCard";
import { WebsiteApprovalCard } from "@/components/admin/WebsiteApprovalCard";
import { ErrorState, LoadingState } from "@/components/ui/Feedback";
import { useAsync } from "@/hooks/useAsync";
import { adminApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { getWebsiteId, type Website } from "@/types";

export default function AdminOverviewPage() {
  const { user } = useAuth();
  const {
    data: websitesData,
    loading,
    error,
    refetch,
    setData,
  } = useAsync(() => adminApi.getPendingWebsites(), []);

  const pending = websitesData?.websites ?? [];

  const removeFromList = (id: string) => {
    setData(
      websitesData
        ? {
            ...websitesData,
            websites: websitesData.websites.filter((w) => getWebsiteId(w) !== id),
            count: websitesData.count - 1,
          }
        : websitesData
    );
  };

  // We don't have global counts on this page — show pending count and a
  // hint about refreshing for the full picture. (Could parallel-fetch
  // getAllWebsites + getAllUsers if needed; out of scope here.)
  return (
    <>
      <Header
        title="Scrappy Admin"
        description={`Welcome back, ${user?.name.split(" ")[0] ?? "Admin"}.`}
      />
      <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <section
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Admin summary"
        >
          <StatCard
            label="Pending Approvals"
            value={pending.length}
            icon={Clock}
          />
          <StatCard label="This Page" value="Pending" icon={Globe} />
          <StatCard label="Active Chatbots" value="—" icon={Bot} />
          <StatCard label="Total Users" value="—" icon={Users} />
        </section>

        {/* Pending approvals */}
        <section aria-label="Pending website approvals">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h3 className="text-[15px] font-semibold text-ink-900">
                Pending Website Approvals
              </h3>
              <p className="mt-0.5 text-[12.5px] text-ink-500">
                {pending.length}{" "}
                {pending.length === 1 ? "submission" : "submissions"} awaiting
                review
              </p>
            </div>
          </div>

          {error && <ErrorState message={error} onRetry={refetch} />}

          {loading ? (
            <LoadingState label="Loading pending websites…" />
          ) : pending.length === 0 ? (
            <div className="rounded-xl border border-dashed border-ink-200 bg-white px-6 py-12 text-center text-[13px] text-ink-500">
              Nothing to review right now.
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((w: Website) => (
                <WebsiteApprovalCard
                  key={getWebsiteId(w)}
                  website={w}
                  onRemove={removeFromList}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}