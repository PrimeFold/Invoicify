"use client";

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const clientCache = new Map<string, CacheEntry<unknown>>();

export function getCachedData<T>(key: string): T | null {
  const entry = clientCache.get(key);
  if (!entry) return null;
  return entry.data as T;
}

export function setCachedData<T>(key: string, data: T): void {
  clientCache.set(key, { data, timestamp: Date.now() });
}

export function invalidateClientCache(keyPrefix?: string): void {
  if (!keyPrefix) {
    clientCache.clear();
    return;
  }
  for (const key of clientCache.keys()) {
    if (key.startsWith(keyPrefix)) {
      clientCache.delete(key);
    }
  }
}
