import Link from "next/link";
import { ExternalLink } from "lucide-react";
import {
  ApprovalStatusBadge,
  IndexingStatusBadge,
  WidgetStatusBadge,
} from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";
import type { User } from "@/types/user";
import type { Website } from "@/types/website";

interface WebsiteTableProps {
  websites: Website[];
  users: User[];
}

/**
 * Responsive table — horizontally scrollable on small screens. Used by the
 * /admin/websites page.
 */
export function WebsiteTable({ websites, users }: WebsiteTableProps) {
  const userById = new Map(users.map((u) => [u.id, u]));

  return (
    <div className="overflow-x-auto rounded-xl border border-ink-200 bg-white">
      <table className="min-w-full divide-y divide-ink-100 text-left">
        <thead className="bg-ink-50/50">
          <tr>
            <Th>Website</Th>
            <Th>Owner</Th>
            <Th>Domain</Th>
            <Th>Approval</Th>
            <Th>Widget</Th>
            <Th>Indexing</Th>
            <Th>Created</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100 text-[13px]">
          {websites.length === 0 && (
            <tr>
              <td
                colSpan={8}
                className="px-4 py-10 text-center text-ink-500"
              >
                No websites match the current filter.
              </td>
            </tr>
          )}
          {websites.map((w) => {
            const owner = userById.get(w.userId);
            return (
              <tr key={w.id} className="hover:bg-ink-50/40">
                <Td>
                  <p className="font-medium text-ink-900">{w.name}</p>
                </Td>
                <Td>
                  <div className="text-ink-700">{owner?.name ?? "—"}</div>
                  <div className="text-[11.5px] text-ink-500">
                    {owner?.email ?? "—"}
                  </div>
                </Td>
                <Td>
                  <a
                    href={w.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-ink-700 hover:text-ink-900"
                  >
                    {w.domain}
                    <ExternalLink size={11} strokeWidth={2.2} />
                  </a>
                </Td>
                <Td>
                  <ApprovalStatusBadge status={w.status} />
                </Td>
                <Td>
                  <WidgetStatusBadge status={w.widgetStatus} />
                </Td>
                <Td>
                  <IndexingStatusBadge status={w.indexingStatus} />
                </Td>
                <Td className="text-ink-500">{formatDate(w.createdAt)}</Td>
                <Td className="text-right">
                  <Link
                    href={`/admin/websites?id=${w.id}`}
                    className="text-[12.5px] font-medium text-ink-700 hover:text-ink-900"
                  >
                    Review
                  </Link>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={[
        "px-4 py-3 text-[11.5px] font-semibold uppercase tracking-wider text-ink-500",
        className,
      ].join(" ")}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={["whitespace-nowrap px-4 py-3", className].join(" ")}>
      {children}
    </td>
  );
}
