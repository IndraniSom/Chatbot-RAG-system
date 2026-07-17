import { motion } from "framer-motion";

interface AvatarProps {
  size?: "sm" | "md" | "lg";
  /** Optional className for positioning */
  className?: string;
}

/**
 * Brand "Scrappy" avatar — a smiling robot face drawn with primitives.
 * Subtle smile pulse using motion.
 */
export function Avatar({ size = "md", className = "" }: AvatarProps) {
  const dim =
    size === "sm" ? 28 : size === "lg" ? 56 : 36;

  return (
    <motion.div
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-2xl shadow-soft ${className}`}
      style={{ width: dim, height: dim }}
      aria-hidden="true"
    >
      {/* Animated gradient backdrop */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-accent-400 via-accent-500 to-accent-600 animate-gradient-shift"
        style={{ backgroundSize: "200% 200%" }}
      />
      {/* Soft inner gloss */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_55%)]" />

      <svg
        viewBox="0 0 32 32"
        width={dim * 0.66}
        height={dim * 0.66}
        fill="none"
      >
        {/* Eyes */}
        <circle cx="13" cy="14" r="2" fill="white" />
        <circle cx="19" cy="14" r="2" fill="white" />
        {/* Smile */}
        <path
          d="M11 19.5 Q16 22.5 21 19.5"
          stroke="white"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        {/* Antenna dot */}
        <circle cx="16" cy="6.5" r="1" fill="white" opacity="0.9" />
        <line
          x1="16"
          y1="6.5"
          x2="16"
          y2="9"
          stroke="white"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.8"
        />
      </svg>
    </motion.div>
  );
}
