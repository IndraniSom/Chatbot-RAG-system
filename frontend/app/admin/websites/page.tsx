"use client";

import { Header } from "@/components/layout/Header";
import { WebsitesAdminClient } from "@/components/admin/WebsitesAdminClient";
import { ErrorState, LoadingState } from "@/components/ui/Feedback";
import { useAsync } from "@/hooks/useAsync";
import { adminApi } from "@/lib/api";

export default function AdminWebsitesPage() {
  const { data, loading, error, refetch } = useAsync(
    () => adminApi.getAllWebsites(),
    []
  );

  return (
    <>
      <Header
        title="All Websites"
        description="Every website submitted to Scrappy."
      />
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {error && <ErrorState message={error} onRetry={refetch} />}
        {loading ? (
          <LoadingState />
        ) : (
          <WebsitesAdminClient websites={data?.websites ?? []} />
        )}
      </div>
    </>
  );
}