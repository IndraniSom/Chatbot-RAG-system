import { Header } from "@/components/layout/Header";
import { UserTable } from "@/components/admin/UserTable";
import { currentAdmin, users, websites } from "@/lib/mock-data";

export default function AdminUsersPage() {
  const websiteCounts: Record<string, number> = {};
  for (const w of websites) {
    websiteCounts[w.userId] = (websiteCounts[w.userId] ?? 0) + 1;
  }

  return (
    <>
      <Header
        title="Users"
        description="Every customer signed up to Scrappy."
        user={currentAdmin}
      />
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <UserTable users={users} websiteCounts={websiteCounts} />
      </div>
    </>
  );
}
