"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Globe,
  Settings,
  LogOut,
  ShieldCheck,
  X,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import type { User } from "@/types/user";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarProps {
  user: User;
  items: NavItem[];
  /** Optional secondary nav shown at the top (e.g. Admin link). */
  secondaryItems?: NavItem[];
  onClose?: () => void;
}

export function Sidebar({
  user,
  items,
  secondaryItems,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-ink-200 bg-white">
      <div className="flex h-16 items-center justify-between border-b border-ink-200 px-5">
        <Link href="/" aria-label="Scrappy home">
          <Logo />
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-ink-500 hover:bg-ink-50 hover:text-ink-900 lg:hidden"
            aria-label="Close navigation"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        {secondaryItems && secondaryItems.length > 0 && (
          <div className="mb-2">
            <p className="px-2 pb-1 text-[10.5px] font-semibold uppercase tracking-wider text-ink-400">
              Admin
            </p>
            <ul className="space-y-0.5">
              {secondaryItems.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  active={pathname.startsWith(item.href)}
                />
              ))}
            </ul>
            <div className="my-3 border-t border-ink-100" />
          </div>
        )}

        <ul className="space-y-0.5">
          {items.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={
                item.href === items[0].href
                  ? pathname === item.href
                  : pathname.startsWith(item.href)
              }
            />
          ))}
        </ul>
      </nav>

      <div className="border-t border-ink-200 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-900 text-[12px] font-semibold text-white"
            aria-hidden="true"
          >
            {user.name
              .split(" ")
              .map((p) => p[0])
              .slice(0, 2)
              .join("")}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-ink-900">
              {user.name}
            </p>
            <p className="truncate text-[11.5px] text-ink-500">{user.email}</p>
          </div>
          <button
            type="button"
            aria-label="Sign out"
            className="rounded-md p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink-700"
          >
            <LogOut size={15} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </aside>
  );
}

function NavLink({
  item,
  active,
}: {
  item: NavItem;
  active: boolean;
}) {
  const Icon = item.icon;
  return (
    <li>
      <Link
        href={item.href}
        className={[
          "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
          active
            ? "bg-ink-900 text-white"
            : "text-ink-600 hover:bg-ink-50 hover:text-ink-900",
        ].join(" ")}
        aria-current={active ? "page" : undefined}
      >
        <Icon size={16} strokeWidth={active ? 2.4 : 2} />
        <span>{item.label}</span>
      </Link>
    </li>
  );
}

export const customerNav: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Websites", href: "/dashboard/websites", icon: Globe },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export const adminNav: NavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Pending Websites", href: "/admin/websites?filter=pending", icon: ShieldCheck },
  { label: "All Websites", href: "/admin/websites", icon: Globe },
  { label: "Users", href: "/admin/users", icon: ShieldCheck },
];
