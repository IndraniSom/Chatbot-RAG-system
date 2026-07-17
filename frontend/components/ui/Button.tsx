import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-700 disabled:bg-ink-300",
  secondary:
    "bg-white text-ink-900 border border-ink-200 hover:bg-ink-50 active:bg-ink-100 disabled:text-ink-300",
  ghost:
    "bg-transparent text-ink-700 hover:bg-ink-50 active:bg-ink-100 disabled:text-ink-300",
  danger:
    "bg-red-600 text-white hover:bg-red-500 active:bg-red-700 disabled:bg-red-200",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-8 px-3 text-[12.5px]",
  md: "h-10 px-4 text-[13.5px]",
  lg: "h-11 px-5 text-[14px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading,
      fullWidth,
      leftIcon,
      rightIcon,
      className = "",
      children,
      disabled,
      ...props
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/40 focus-visible:ring-offset-1",
          "disabled:cursor-not-allowed",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth ? "w-full" : "",
          className,
        ].join(" ")}
        {...props}
      >
        {loading ? (
          <span
            className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent"
            aria-hidden="true"
          />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!loading && rightIcon}
      </button>
    );
  }
);
