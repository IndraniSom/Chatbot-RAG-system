import { motion } from "framer-motion";
import { Moon, Sun, X, Settings2 } from "lucide-react";
import { Avatar } from "./Avatar";
import { StatusBadge } from "./StatusBadge";
import type { Theme } from "../types";

interface HeaderProps {
  onClose: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

/**
 * Editorial header. Subtle gradient + grain + hairline border.
 * Italic serif tagline gives it personality vs the standard SaaS header.
 */
export function Header({ onClose, theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="grain relative overflow-hidden border-b border-white/[0.06]">
      {/* Animated gradient backdrop */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-accent-500 via-accent-400 to-accent-600 animate-gradient-shift"
        style={{ backgroundSize: "200% 200%" }}
      />
      {/* Soft mesh overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(0,0,0,0.18),transparent_50%)]" />

      <div className="relative flex items-center gap-3 px-4 py-3.5">
        <Avatar size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-[15px] font-semibold leading-none tracking-tight text-white">
              Scrappy AI
            </h2>
            <div className="rounded-full bg-white/15 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-white">
              Beta
            </div>
          </div>
          <p className="mt-1 truncate font-serif text-[12.5px] italic leading-none text-white/80">
            ask anything about this website
          </p>
        </div>

        <div className="flex items-center gap-1">
          <StatusBadge status="online" />

          <IconButton
            label="Toggle theme"
            onClick={onToggleTheme}
            className="ml-2"
          >
            <motion.span
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="block"
            >
              {theme === "dark" ? (
                <Sun size={16} strokeWidth={2.2} />
              ) : (
                <Moon size={16} strokeWidth={2.2} />
              )}
            </motion.span>
          </IconButton>

          <IconButton label="Settings" disabled>
            <Settings2 size={16} strokeWidth={2.2} />
          </IconButton>

          <IconButton label="Close chat" onClick={onClose}>
            <X size={16} strokeWidth={2.4} />
          </IconButton>
        </div>
      </div>
    </header>
  );
}

interface IconButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  label: string;
  className?: string;
  disabled?: boolean;
}

function IconButton({
  children,
  onClick,
  label,
  className = "",
  disabled = false,
}: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      disabled={disabled}
      className={`relative inline-flex h-8 w-8 items-center justify-center rounded-full text-white/90 transition-all duration-200 hover:bg-white/15 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  );
}
