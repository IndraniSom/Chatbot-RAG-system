import { Users, Globe, Clock, Bot } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/dashboard/StatCard";
import { WebsiteApprovalCard } from "@/components/admin/WebsiteApprovalCard";
import { currentAdmin, users, websites } from "@/lib/mock-data";

export default function AdminOverviewPage() {
  const pending = websites.filter((w) => w.status === "PENDING");
  const active = websites.filter((w) => w.widgetStatus === "INSTALLED");
  const usersById = new Map(users.map((u) => [u.id, u]));

  return (
    <>
      <Header
        title="Scrappy Admin"
        description="Approve websites and manage customers."
        user={currentAdmin}
      />
      <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <section
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Admin summary"
        >
          <StatCard label="Total Users" value={users.length} icon={Users} />
          <StatCard
            label="Total Websites"
            value={websites.length}
            icon={Globe}
          />
          <StatCard
            label="Pending Approvals"
            value={pending.length}
            icon={Clock}
          />
          <StatCard
            label="Active Chatbots"
            value={active.length}
            icon={Bot}
          />
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

          {pending.length === 0 ? (
            <div className="rounded-xl border border-dashed border-ink-200 bg-white px-6 py-12 text-center text-[13px] text-ink-500">
              Nothing to review right now.
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((w) => (
                <WebsiteApprovalCard
                  key={w.id}
                  website={w}
                  owner={usersById.get(w.userId)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
