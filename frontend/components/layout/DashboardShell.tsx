"use client";

import { createContext, useContext, useState } from "react";
import { Sidebar, type NavItem } from "./Sidebar";
import { useAuth } from "@/hooks/useAuth";

interface DashboardShellContextValue {
  openSidebar: () => void;
}

const DashboardShellContext = createContext<DashboardShellContextValue>({
  openSidebar: () => {},
});

export const useDashboardShell = () => useContext(DashboardShellContext);

interface DashboardShellProps {
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
 *  - Reads the authenticated user from the auth context so we never pass
 *    stale mock data down.
 */
export function DashboardShell({
  items,
  secondaryItems,
  children,
}: DashboardShellProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  // While the user is hydrating, render nothing in the sidebar slot rather
  // than crashing on `user.name`. RequireAuth upstream already gates the
  // whole tree, so user should always be defined here in practice.
  if (!user) return null;

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