import { useEffect, useRef } from "react";

/**
 * Auto-grow a textarea up to maxHeight as the user types.
 */
export function useAutoResize(
  value: string,
  maxHeight = 140
) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const next = Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${next}px`;
  }, [value, maxHeight]);

  return ref;
}
