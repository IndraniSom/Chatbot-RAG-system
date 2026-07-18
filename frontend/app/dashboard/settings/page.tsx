"use client";

import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/lib/format";
import { LoadingState } from "@/components/ui/Feedback";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <>
      <Header
        title="Settings"
        description="Manage your account preferences."
      />
      <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <h2 className="text-[15px] font-semibold text-ink-900">Profile</h2>
          <p className="mt-1 text-[13px] text-ink-500">
            Your account details.
          </p>
          {user ? (
            <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Name" value={user.name} />
              <Field label="Email" value={user.email} />
              <Field label="Role" value={user.role} />
              <Field label="Joined" value={formatDate(user.createdAt)} />
            </dl>
          ) : (
            <div className="mt-5">
              <LoadingState />
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11.5px] font-medium uppercase tracking-wider text-ink-400">
        {label}
      </dt>
      <dd className="mt-1 text-[13.5px] text-ink-900">{value}</dd>
    </div>
  );
}