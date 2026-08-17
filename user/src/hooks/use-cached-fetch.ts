import { useEffect, useState } from "react";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  promise?: Promise<T>;
}

const cacheStore = new Map<string, CacheEntry<any>>();

interface UseCachedFetchOptions {
  staleTime?: number;
}

export function useCachedFetch<T>(
  key: string | null,
  fetchFn: () => Promise<T>,
  options: UseCachedFetchOptions = {},
) {
  const { staleTime = 60_000 } = options;
  const cached = key ? cacheStore.get(key) : undefined;
  const isFresh = cached && Date.now() - cached.timestamp < staleTime;

  const [data, setData] = useState<T | undefined>(cached?.data);
  const [isLoading, setIsLoading] = useState(!!key && !isFresh);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!key) {
      setIsLoading(false);
      return;
    }

    let active = true;
    const existing = cacheStore.get(key);
    const fresh = existing && Date.now() - existing.timestamp < staleTime;

    if (fresh) {
      setData(existing.data);
      setIsLoading(false);
      return;
    }

    if (existing?.promise) {
      setIsLoading(true);
      existing.promise
        .then((result) => {
          if (active) {
            setData(result);
            setIsLoading(false);
          }
        })
        .catch((err) => {
          if (active) {
            setError(err);
            setIsLoading(false);
          }
        });
      return;
    }

    setIsLoading(true);
    const promise = fetchFn();
    cacheStore.set(key, { data: existing?.data, timestamp: Date.now(), promise });

    promise
      .then((result) => {
        cacheStore.set(key, { data: result, timestamp: Date.now() });
        if (active) {
          setData(result);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        cacheStore.delete(key);
        if (active) {
          setError(err);
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, isLoading, error };
}