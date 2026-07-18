"use client";

import { useCallback, useEffect, useState } from "react";

interface UseAsyncResult<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  /** Manually re-run the fetcher. */
  refetch: () => Promise<void>;
  /** Imperatively set data (e.g. after a mutation). */
  setData: (data: T | null) => void;
}

/**
 * Tiny data-fetching hook. Calls `fetcher()` on mount and when deps change.
 *  - `data` is null until the first successful fetch
 *  - `error` is a human-readable string (or null)
 *  - `refetch()` re-runs the fetcher (e.g. after a mutation)
 *  - `setData()` lets callers override the cached value without re-fetching
 *
 * No retry, no caching — keep it small and obvious.
 */
export function useAsync<T>(
  fetcher: () => Promise<T>,
  deps: ReadonlyArray<unknown> = []
): UseAsyncResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // We intentionally do not include `fetcher` in deps — callers usually pass
  // an inline closure, and we want stable behaviour when they don't memo it.
  // Instead we expose refetch() for explicit re-runs.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load.";
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  return { data, error, loading, refetch: run, setData };
}