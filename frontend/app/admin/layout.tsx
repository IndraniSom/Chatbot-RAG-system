import { DashboardShell } from "@/components/layout/DashboardShell";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { adminNav } from "@/components/layout/Sidebar";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <DashboardShell items={adminNav}>
        {children}
      </DashboardShell>
    </RequireAuth>
  );
}
