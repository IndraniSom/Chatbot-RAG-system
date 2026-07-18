import type { Metadata } from "next";
import { NavBar } from "@/components/install/NavBar";
import { Hero } from "@/components/install/Hero";
import { Features } from "@/components/install/Features";
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
    // Dark-only surface. The root layout paints the body white, so we cover it
    // with a full-bleed dark canvas scoped to this route.
    <div className="min-h-screen scroll-smooth bg-[#08080C] text-ink-100 antialiased">
      {/* faint animated grid texture behind everything */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 80% 50% at 50% 0%, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 50% at 50% 0%, black 30%, transparent 75%)",
        }}
      />

      <div className="relative z-10" id="top">
        <NavBar />
        <main>
          <Hero />
          <Features />

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
