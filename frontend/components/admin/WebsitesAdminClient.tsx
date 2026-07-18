"use client";

import { useState } from "react";
import { WebsiteTable } from "@/components/admin/WebsiteTable";
import { FilterTabs } from "@/components/admin/FilterTabs";
import type { Website, ApprovalStatus } from "@/types";

type Filter = "all" | "pending" | "approved" | "rejected";

const filterToStatus: Record<Filter, ApprovalStatus | null> = {
  all: null,
  pending: "PENDING",
  approved: "APPROVED",
  rejected: "REJECTED",
};

interface Props {
  websites: Website[];
}

export function WebsitesAdminClient({ websites }: Props) {
  const [filter, setFilter] = useState<Filter>("all");

  const counts: Record<Filter, number> = {
    all: websites.length,
    pending: websites.filter((w) => w.status === "PENDING").length,
    approved: websites.filter((w) => w.status === "APPROVED").length,
    rejected: websites.filter((w) => w.status === "REJECTED").length,
  };

  const targetStatus = filterToStatus[filter];
  const visible: Website[] =
    targetStatus === null
      ? websites
      : websites.filter((w) => w.status === targetStatus);

  return (
    <div className="space-y-4">
      <FilterTabs<Filter>
        options={[
          { value: "all", label: "All", count: counts.all },
          { value: "pending", label: "Pending", count: counts.pending },
          { value: "approved", label: "Approved", count: counts.approved },
          { value: "rejected", label: "Rejected", count: counts.rejected },
        ]}
        initial="all"
        onChange={setFilter}
      />
      <WebsiteTable websites={visible} />
    </div>
  );
}