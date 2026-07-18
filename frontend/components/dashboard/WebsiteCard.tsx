import Link from "next/link";
import { ArrowUpRight, Globe } from "lucide-react";
import { Card } from "@/components/ui/Card";
import {
  ApprovalStatusBadge,
  IndexingStatusBadge,
  WidgetStatusBadge,
} from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getWebsiteId, type Website } from "@/types";

interface WebsiteCardProps {
  website: Website;
}

export function WebsiteCard({ website }: WebsiteCardProps) {
  const id = getWebsiteId(website);
  return (
    <Card className="flex h-full flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-ink-700"
              aria-hidden
            >
              <Globe size={16} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[14.5px] font-semibold text-ink-900">
                {website.name}
              </p>
              <p className="mt-0.5 truncate text-[12.5px] text-ink-500">
                {website.url}
              </p>
            </div>
          </div>
          <ApprovalStatusBadge status={website.status} />
        </div>

        <div className="mt-5 flex flex-wrap gap-1.5">
          <WidgetStatusBadge status={website.widgetStatus} />
          <IndexingStatusBadge status={website.indexingStatus} />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Link
          href={`/dashboard/websites/${id}`}
          className="inline-flex items-center gap-1 text-[12.5px] font-medium text-ink-700 hover:text-ink-900"
        >
          View details
          <ArrowUpRight size={13} strokeWidth={2.2} />
        </Link>
        <Link href={`/dashboard/websites/${id}`}>
          <Button size="sm" variant="secondary">
            Manage Website
          </Button>
        </Link>
      </div>
    </Card>
  );
}
