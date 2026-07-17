import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, leftIcon, id, className = "", ...props },
  ref
) {
  const inputId = id || props.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[12.5px] font-medium text-ink-700"
        >
          {label}
        </label>
      )}
      <div
        className={[
          "relative flex items-center rounded-lg border bg-white transition-colors",
          error
            ? "border-red-400 focus-within:border-red-500"
            : "border-ink-200 focus-within:border-ink-900",
        ].join(" ")}
      >
        {leftIcon && (
          <span className="pl-3 text-ink-400" aria-hidden>
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            "w-full bg-transparent px-3 py-2.5 text-[14px] text-ink-900 placeholder:text-ink-400 outline-none",
            leftIcon ? "pl-2" : "",
            className,
          ].join(" ")}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          {...props}
        />
      </div>
      {error ? (
        <p
          id={`${inputId}-error`}
          className="text-[12px] font-medium text-red-600"
        >
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-[12px] text-ink-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
});
