import { DashboardShell } from "@/components/layout/DashboardShell";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { customerNav } from "@/components/layout/Sidebar";

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <DashboardShell items={customerNav}>
        {children}
      </DashboardShell>
    </RequireAuth>
  );
}
