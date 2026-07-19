import type { Metadata } from "next";
import { NavBar } from "@/components/install/NavBar";
import { Hero } from "@/components/install/Hero";
import { Features } from "@/components/install/Features";
import { CustomizationShowcase } from "@/components/install/CustomizationShowcase";
import { InstallationFlow } from "@/components/install/InstallationFlow";
import { FrameworkTabs } from "@/components/install/FrameworkTabs";
import { Verification } from "@/components/install/Verification";
import { Troubleshooting } from "@/components/install/Troubleshooting";
import { DeveloperAPI } from "@/components/install/DeveloperAPI";
import { FAQ } from "@/components/install/FAQ";
import { Footer } from "@/components/install/Footer";
import { StickySidebar } from "@/components/install/StickySidebar";

export const metadata: Metadata = {
  title: "Install Scrappy AI — Documentation",
  description:
    "Integrate an AI-powered chatbot into any website with a single script tag. Guides for HTML, Next.js, React, Vue, Angular, WordPress, Shopify, Webflow and more.",
};

export default function InstallPage() {
  return (
    <div className="min-h-screen scroll-smooth bg-[#F8F5EE] text-ink-900 antialiased">
      {/* Fine drafting grid fades out below the hero like a sheet of studio paper. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(10,10,11,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(10,10,11,0.045) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 85% 62% at 50% 0%, black 20%, transparent 78%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 85% 62% at 50% 0%, black 20%, transparent 78%)",
        }}
      />

      <div className="relative z-10" id="top">
        <NavBar />
        <main>
          <Hero />
          <Features />
          <CustomizationShowcase />

          {/* Docs body with sticky in-page nav on wide screens */}
          <div className="mx-auto flex max-w-7xl gap-10 px-0 xl:px-6">
            <div className="hidden pt-28 xl:block">
              <StickySidebar />
            </div>
            <div className="min-w-0 flex-1">
              <InstallationFlow />
              <FrameworkTabs />
              <Verification />
              <Troubleshooting />
              <DeveloperAPI />
              <FAQ />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
