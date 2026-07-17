import { motion } from "framer-motion";
import { useState } from "react";

interface FloatingChatButtonProps {
  isOpen: boolean;
  onClick: () => void;
  unread?: number;
}

/**
 * The floating launcher. Premium details:
 *  • Animated blob gradient that shifts slowly while idle.
 *  • Outer glow ring.
 *  • Ripple burst on click (button pseudo-clones into a fast expanding ring).
 *  • Subtle continuous breathing animation.
 */
export function FloatingChatButton({
  isOpen,
  onClick,
  unread = 0,
}: FloatingChatButtonProps) {
  const [rippleKey, setRippleKey] = useState(0);

  return (
    <motion.button
      type="button"
      onClick={() => {
        setRippleKey((k) => k + 1);
        onClick();
      }}
      aria-label={isOpen ? "Close chat" : "Open Scrappy AI chat"}
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      className="group fixed bottom-[24px] right-[24px] z-50 inline-flex h-[60px] w-[60px] items-center justify-center md:bottom-6 md:right-6"
      style={{ translateZ: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.93 }}
      transition={{ type: "spring", stiffness: 380, damping: 18 }}
    >
      {/* Outer glow */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-full bg-accent-500/30 blur-xl transition-opacity duration-300 group-hover:bg-accent-500/50"
      />
      {/* Pulsing ring */}
      <motion.span
        aria-hidden
        className="absolute inset-[-4px] rounded-full ring-1 ring-accent-500/30"
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Main gradient button */}
      <span
        className="relative inline-flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-accent-400 via-accent-500 to-accent-700 shadow-elevated"
        style={{ backgroundSize: "200% 200%" }}
      >
        {/* Blob gradient animation */}
        <span
          aria-hidden
          className="absolute inset-0 animate-gradient-shift opacity-90"
          style={{
            background:
              "linear-gradient(135deg, #8C95FF 0%, #6071FF 40%, #3D5AFE 100%)",
            backgroundSize: "200% 200%",
          }}
        />
        {/* Inner gloss */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.5),transparent_55%)]"
        />

        {/* Robot face */}
        <svg
          viewBox="0 0 32 32"
          width={26}
          height={26}
          fill="none"
          aria-hidden
        >
          <circle cx="13" cy="14" r="2.2" fill="white" />
          <circle cx="19" cy="14" r="2.2" fill="white" />
          <path
            d="M11 19.5 Q16 22.5 21 19.5"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="16" cy="6.5" r="1.2" fill="white" opacity="0.95" />
          <line
            x1="16"
            y1="6.5"
            x2="16"
            y2="9"
            stroke="white"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        </svg>

        {/* Click ripple */}
        {rippleKey > 0 && (
          <span
            key={rippleKey}
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-white/60"
            style={{
              animation: "ripple-out 600ms cubic-bezier(0.16,1,0.3,1) forwards",
            }}
          />
        )}

        {/* Notification badge */}
        {unread > 0 && !isOpen && (
          <span
            aria-label={`${unread} unread message${unread === 1 ? "" : "s"}`}
            className="absolute -right-1 -top-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white shadow-soft"
            style={{ height: 18 }}
          >
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </span>

      <style>{`
        @keyframes ripple-out {
          0%   { transform: scale(0.92); opacity: 0.7; }
          100% { transform: scale(1.6);  opacity: 0;   }
        }
      `}</style>
    </motion.button>
  );
}
