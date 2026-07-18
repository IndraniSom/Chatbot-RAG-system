"use client";

import { useEffect, useState } from "react";

const sections = [
  { id: "top", label: "Overview" },
  { id: "flow", label: "How it works" },
  { id: "frameworks", label: "Framework guides" },
  { id: "verify", label: "Verification" },
  { id: "troubleshooting", label: "Troubleshooting" },
  { id: "api", label: "Developer API" },
  { id: "faq", label: "FAQ" },
];

/**
 * Sticky in-page navigation with a scroll-spy active indicator. Rendered
 * alongside the docs content on large screens only.
 */
export function StickySidebar() {
  const [active, setActive] = useState("top");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <aside className="sticky top-24 hidden h-fit w-52 shrink-0 xl:block">
      <p className="mb-4 pl-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-500">
        On this page
      </p>
      <nav className="relative flex flex-col gap-0.5 border-l border-white/[0.08]">
        {sections.map((s) => {
          const isActive = active === s.id;
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`relative -ml-px border-l-2 py-1.5 pl-4 text-[13px] transition-colors ${
                isActive
                  ? "border-iris-400 font-medium text-white"
                  : "border-transparent text-ink-400 hover:text-ink-200"
              }`}
            >
              {s.label}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
