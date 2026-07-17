"use client";

import { createContext, useContext, useState } from "react";
import { Sidebar, type NavItem } from "./Sidebar";
import type { User } from "@/types/user";

interface DashboardShellContextValue {
  openSidebar: () => void;
}

const DashboardShellContext = createContext<DashboardShellContextValue>({
  openSidebar: () => {},
});

export const useDashboardShell = () => useContext(DashboardShellContext);

interface DashboardShellProps {
  user: User;
  items: NavItem[];
  secondaryItems?: NavItem[];
  children: React.ReactNode;
}

/**
 * Shared responsive shell used by both /dashboard and /admin layouts.
 *
 *  - Desktop (lg+): permanent left sidebar.
 *  - Mobile/Tablet: sidebar is hidden, accessible via header hamburger
 *    (call `useDashboardShell().openSidebar()` from the page header).
 */
export function DashboardShell({
  user,
  items,
  secondaryItems,
  children,
}: DashboardShellProps) {
  const [open, setOpen] = useState(false);

  return (
    <DashboardShellContext.Provider value={{ openSidebar: () => setOpen(true) }}>
      <div className="flex min-h-screen bg-ink-50">
        <div className="hidden lg:block">
          <Sidebar user={user} items={items} secondaryItems={secondaryItems} />
        </div>

        {open && (
          <div
            className="fixed inset-0 z-50 lg:hidden"
            role="dialog"
            aria-modal="true"
          >
            <div
              className="absolute inset-0 bg-ink-900/40"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <div className="absolute inset-y-0 left-0">
              <Sidebar
                user={user}
                items={items}
                secondaryItems={secondaryItems}
                onClose={() => setOpen(false)}
              />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </DashboardShellContext.Provider>
  );
}
