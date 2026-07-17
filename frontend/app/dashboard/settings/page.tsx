import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { currentUser } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";

export default function SettingsPage() {
  return (
    <>
      <Header
        title="Settings"
        description="Manage your account preferences."
        user={currentUser}
      />
      <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <h2 className="text-[15px] font-semibold text-ink-900">Profile</h2>
          <p className="mt-1 text-[13px] text-ink-500">
            Your account details.
          </p>
          <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Name" value={currentUser.name} />
            <Field label="Email" value={currentUser.email} />
            <Field label="Role" value={currentUser.role} />
            <Field label="Joined" value={formatDate(currentUser.joinedAt)} />
          </dl>
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
