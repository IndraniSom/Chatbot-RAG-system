"use client";

import { useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { UserTable } from "@/components/admin/UserTable";
import { ErrorState, LoadingState } from "@/components/ui/Feedback";
import { useAsync } from "@/hooks/useAsync";
import { adminApi } from "@/lib/api";

export default function AdminUsersPage() {
  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useAsync(() => adminApi.getAllUsers(), []);

  const {
    data: websitesData,
    loading: websitesLoading,
    error: websitesError,
  } = useAsync(() => adminApi.getAllWebsites(), []);

  const websiteCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (websitesData?.websites) {
      for (const w of websitesData.websites) {
        // Owner can be a string (rare; admin route populates) — only count
        // populated refs so the counts stay aligned with the admin table.
        const ownerId =
          typeof w.userId === "string" ? w.userId : w.userId?._id;
        if (!ownerId) continue;
        counts[ownerId] = (counts[ownerId] ?? 0) + 1;
      }
    }
    return counts;
  }, [websitesData]);

  const error = usersError || websitesError;
  const loading = usersLoading && websitesLoading;

  return (
    <>
      <Header
        title="Users"
        description="Every customer signed up to Scrappy."
      />
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {error && <ErrorState message={error} onRetry={refetchUsers} />}
        {loading ? (
          <LoadingState />
        ) : (
          <UserTable
            users={usersData?.users ?? []}
            websiteCounts={websiteCounts}
          />
        )}
      </div>
    </>
  );
}