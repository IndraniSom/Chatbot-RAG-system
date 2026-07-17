import Link from "next/link";
import { Plus } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { WebsiteCard } from "@/components/dashboard/WebsiteCard";
import { Button } from "@/components/ui/Button";
import { currentUser, getUserWebsites } from "@/lib/mock-data";

export default function MyWebsitesPage() {
  const websites = getUserWebsites(currentUser.id);

  return (
    <>
      <Header
        title="My Websites"
        description="Every website you've connected to Scrappy."
        user={currentUser}
        actions={
          <Link href="/dashboard/websites/new">
            <Button leftIcon={<Plus size={15} strokeWidth={2.4} />}>
              Add Website
            </Button>
          </Link>
        }
      />
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <p className="text-[13px] text-ink-500">
            {websites.length}{" "}
            {websites.length === 1 ? "website" : "websites"}
          </p>
        </div>

        {websites.length === 0 ? (
          <div className="rounded-xl border border-dashed border-ink-200 bg-white px-6 py-16 text-center text-[13.5px] text-ink-500">
            You haven't added any websites yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {websites.map((w) => (
              <WebsiteCard key={w.id} website={w} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
