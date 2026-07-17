import { Header } from "@/components/layout/Header";
import { WebsitesAdminClient } from "@/components/admin/WebsitesAdminClient";
import { currentAdmin, users, websites } from "@/lib/mock-data";

export default function AdminWebsitesPage() {
  return (
    <>
      <Header
        title="All Websites"
        description="Every website submitted to Scrappy."
        user={currentAdmin}
      />
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <WebsitesAdminClient websites={websites} users={users} />
      </div>
    </>
  );
}
