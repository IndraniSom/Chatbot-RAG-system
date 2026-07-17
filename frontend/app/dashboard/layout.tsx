import { DashboardShell } from "@/components/layout/DashboardShell";
import { customerNav } from "@/components/layout/Sidebar";
import { currentUser } from "@/lib/mock-data";

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell user={currentUser} items={customerNav}>
      {children}
    </DashboardShell>
  );
}
