/**
 * Scrappy wordmark + mark. Used in the auth screens, sidebar, and favicon-ish spots.
 */
export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dim = size === "lg" ? 36 : size === "sm" ? 22 : 28;
  return (
    <div className="inline-flex items-center gap-2.5">
      <span
        className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-ink-900"
        style={{ width: dim, height: dim }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 32 32"
          width={dim * 0.62}
          height={dim * 0.62}
          fill="none"
        >
          <circle cx="13" cy="14" r="2" fill="white" />
          <circle cx="19" cy="14" r="2" fill="white" />
          <path
            d="M11 19.5 Q16 22.5 21 19.5"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
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
      </span>
      <span
        className={[
          "font-semibold tracking-tight text-ink-900",
          size === "lg" ? "text-[18px]" : "text-[15px]",
        ].join(" ")}
      >
        Scrappy
      </span>
    </div>
  );
}
