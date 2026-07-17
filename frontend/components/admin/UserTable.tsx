import { AccountStatusBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";
import type { User } from "@/types/user";

interface UserTableProps {
  users: User[];
  /** Map of userId → number of websites they own. */
  websiteCounts: Record<string, number>;
}

export function UserTable({ users, websiteCounts }: UserTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-ink-200 bg-white">
      <table className="min-w-full divide-y divide-ink-100 text-left">
        <thead className="bg-ink-50/50">
          <tr>
            <Th>User</Th>
            <Th>Email</Th>
            <Th>Websites</Th>
            <Th>Status</Th>
            <Th>Joined</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100 text-[13px]">
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-ink-50/40">
              <td className="whitespace-nowrap px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-900 text-[11px] font-semibold text-white">
                    {u.name
                      .split(" ")
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <span className="font-medium text-ink-900">{u.name}</span>
                </div>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-ink-700">
                {u.email}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-ink-700">
                {websiteCounts[u.id] ?? 0}
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <AccountStatusBadge status={u.status} />
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-ink-500">
                {formatDate(u.joinedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      scope="col"
      className="px-4 py-3 text-[11.5px] font-semibold uppercase tracking-wider text-ink-500"
    >
      {children}
    </th>
  );
}
