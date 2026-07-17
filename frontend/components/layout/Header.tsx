"use client";

import { Bell, Menu } from "lucide-react";
import { useDashboardShell } from "./DashboardShell";
import type { User } from "@/types/user";

interface HeaderProps {
  title: string;
  description?: string;
  user: User;
  actions?: React.ReactNode;
}

export function Header({ title, description, user, actions }: HeaderProps) {
  const { openSidebar } = useDashboardShell();
  return (
    <header className="sticky top-0 z-30 border-b border-ink-200 bg-white/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={openSidebar}
            aria-label="Open navigation"
            className="rounded-md p-2 text-ink-500 hover:bg-ink-50 hover:text-ink-900 lg:hidden"
          >
            <Menu size={18} />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-[16px] font-semibold tracking-tight text-ink-900">
              {title}
            </h1>
            {description && (
              <p className="hidden truncate text-[12.5px] text-ink-500 sm:block">
                {description}
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {actions}
          <button
            type="button"
            aria-label="Notifications"
            className="relative rounded-md p-2 text-ink-500 hover:bg-ink-50 hover:text-ink-900"
          >
            <Bell size={17} strokeWidth={2} />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
          </button>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-900 text-[11px] font-semibold text-white"
            aria-label={user.name}
          >
            {user.name
              .split(" ")
              .map((p) => p[0])
              .slice(0, 2)
              .join("")}
          </div>
        </div>
      </div>
    </header>
  );
}
