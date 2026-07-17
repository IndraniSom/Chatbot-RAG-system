import { DashboardShell } from "@/components/layout/DashboardShell";
import { adminNav } from "@/components/layout/Sidebar";
import { currentAdmin } from "@/lib/mock-data";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell user={currentAdmin} items={adminNav}>
      {children}
    </DashboardShell>
  );
}
