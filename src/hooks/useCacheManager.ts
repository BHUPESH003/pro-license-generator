"use client";

import { useRef, useCallback } from "react";
import { TableCache } from "../components/ui/CustomDataTable.types";

interface CacheConfig {
  maxSize: number;
  defaultTimeout: number;
  enableMetrics: boolean;
}

interface CacheMetrics {
  hits: number;
  misses: number;
  evictions: number;
  totalRequests: number;
  hitRate: number;
  averageResponseTime: number;
  cacheSize: number;
}

interface CacheEntry<T> extends TableCache<T> {
  accessCount: number;
  lastAccessed: number;
  responseTime?: number;
}

export function useCacheManager<T = any>(config: Partial<CacheConfig> = {}) {
  const {
    maxSize = 50,
    defaultTimeout = 5 * 60 * 1000, // 5 minutes
    enableMetrics = false,
  } = config;

  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());
  const metricsRef = useRef<CacheMetrics>({
    hits: 0,
    misses: 0,
    evictions: 0,
    totalRequests: 0,
    hitRate: 0,
    averageResponseTime: 0,
    cacheSize: 0,
  });

  // Generate cache key with consistent ordering
  const generateCacheKey = useCallback(
    (params: Record<string, any>): string => {
      const sortedParams = Object.keys(params)
        .sort()
        .reduce((result, key) => {
          result[key] = params[key];
          return result;
        }, {} as Record<string, any>);

      return JSON.stringify(sortedParams);
    },
    []
  );

  // Get cached data with LRU tracking
  const get = useCallback(
    (key: string, timeout?: number): CacheEntry<T> | null => {
      const entry = cacheRef.current.get(key);
      const now = Date.now();
      const effectiveTimeout = timeout || defaultTimeout;

      if (enableMetrics) {
        metricsRef.current.totalRequests++;
      }

      if (!entry) {
        if (enableMetrics) {
          metricsRef.current.misses++;
          updateMetrics();
        }
        return null;
      }

      // Check if entry is expired
      if (now - entry.timestamp > effectiveTimeout) {
        cacheRef.current.delete(key);
        if (enableMetrics) {
          metricsRef.current.misses++;
          metricsRef.current.evictions++;
          updateMetrics();
        }
        return null;
      }

      // Update access tracking for LRU
      entry.accessCount++;
      entry.lastAccessed = now;

      if (enableMetrics) {
        metricsRef.current.hits++;
        updateMetrics();
      }

      return entry;
    },
    [defaultTimeout, enableMetrics]
  );

  // Set cached data with intelligent eviction
  const set = useCallback(
    (
      key: string,
      data: T[],
      total: number,
      filters: Record<string, any>,
      sort: { field?: string; direction?: "asc" | "desc" },
      responseTime?: number
    ) => {
      const now = Date.now();
      const entry: CacheEntry<T> = {
        key,
        data,
        total,
        timestamp: now,
        filters,
        sort,
        accessCount: 1,
        lastAccessed: now,
        responseTime,
      };

      cacheRef.current.set(key, entry);

      // Cleanup expired entries first
      cleanupExpiredEntries();

      // If still over limit, evict least recently used entries
      if (cacheRef.current.size > maxSize) {
        evictLRUEntries();
      }

      if (enableMetrics) {
        updateMetrics();
      }
    },
    [maxSize, enableMetrics]
  );

  // Clean up expired entries
  const cleanupExpiredEntries = useCallback(() => {
    const now = Date.now();
    let evicted = 0;

    for (const [key, entry] of cacheRef.current.entries()) {
      if (now - entry.timestamp > defaultTimeout) {
        cacheRef.current.delete(key);
        evicted++;
      }
    }

    if (enableMetrics && evicted > 0) {
      metricsRef.current.evictions += evicted;
    }
  }, [defaultTimeout, enableMetrics]);

  // Evict least recently used entries
  const evictLRUEntries = useCallback(() => {
    const entries = Array.from(cacheRef.current.entries());

    // Sort by last accessed time (oldest first) and access count (least used first)
    entries.sort((a, b) => {
      const [, entryA] = a;
      const [, entryB] = b;

      // Primary sort: last accessed time
      const timeDiff = entryA.lastAccessed - entryB.lastAccessed;
      if (timeDiff !== 0) return timeDiff;

      // Secondary sort: access count
      return entryA.accessCount - entryB.accessCount;
    });

    // Remove oldest entries until we're under the limit
    const entriesToRemove = entries.slice(0, entries.length - maxSize + 1);
    let evicted = 0;

    for (const [key] of entriesToRemove) {
      cacheRef.current.delete(key);
      evicted++;
    }

    if (enableMetrics && evicted > 0) {
      metricsRef.current.evictions += evicted;
    }
  }, [maxSize, enableMetrics]);

  // Update cache metrics
  const updateMetrics = useCallback(() => {
    const metrics = metricsRef.current;
    metrics.hitRate =
      metrics.totalRequests > 0
        ? (metrics.hits / metrics.totalRequests) * 100
        : 0;
    metrics.cacheSize = cacheRef.current.size;

    // Calculate average response time
    const entries = Array.from(cacheRef.current.values());
    const responseTimes = entries
      .map((entry) => entry.responseTime)
      .filter((time): time is number => typeof time === "number");

    metrics.averageResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((sum, time) => sum + time, 0) /
          responseTimes.length
        : 0;
  }, []);

  // Invalidate cache entries based on patterns
  const invalidate = useCallback(
    (pattern?: string | RegExp) => {
      if (!pattern) {
        // Clear all cache
        const size = cacheRef.current.size;
        cacheRef.current.clear();

        if (enableMetrics) {
          metricsRef.current.evictions += size;
          updateMetrics();
        }
        return;
      }

      let evicted = 0;
      const regex =
        typeof pattern === "string"
          ? new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
          : pattern;

      for (const [key] of cacheRef.current.entries()) {
        if (regex.test(key)) {
          cacheRef.current.delete(key);
          evicted++;
        }
      }

      if (enableMetrics && evicted > 0) {
        metricsRef.current.evictions += evicted;
        updateMetrics();
      }
    },
    [enableMetrics, updateMetrics]
  );

  // Get cache statistics
  const getMetrics = useCallback((): CacheMetrics => {
    if (enableMetrics) {
      updateMetrics();
      return { ...metricsRef.current };
    }
    return {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalRequests: 0,
      hitRate: 0,
      averageResponseTime: 0,
      cacheSize: cacheRef.current.size,
    };
  }, [enableMetrics, updateMetrics]);

  // Prefetch data for anticipated requests
  const prefetch = useCallback(
    async (
      keys: string[],
      fetcher: (key: string) => Promise<{
        data: T[];
        total: number;
        filters: Record<string, any>;
        sort: { field?: string; direction?: "asc" | "desc" };
      }>
    ) => {
      const promises = keys
        .filter((key) => !cacheRef.current.has(key))
        .map(async (key) => {
          try {
            const startTime = Date.now();
            const result = await fetcher(key);
            const responseTime = Date.now() - startTime;

            set(
              key,
              result.data,
              result.total,
              result.filters,
              result.sort,
              responseTime
            );
          } catch (error) {
            console.warn(`Prefetch failed for key: ${key}`, error);
          }
        });

      await Promise.allSettled(promises);
    },
    [set]
  );

  // Check if cache has space for new entries
  const hasSpace = useCallback(() => {
    return cacheRef.current.size < maxSize;
  }, [maxSize]);

  // Get cache size information
  const getSizeInfo = useCallback(() => {
    return {
      current: cacheRef.current.size,
      max: maxSize,
      usage: (cacheRef.current.size / maxSize) * 100,
    };
  }, [maxSize]);

  return {
    generateCacheKey,
    get,
    set,
    invalidate,
    getMetrics,
    prefetch,
    hasSpace,
    getSizeInfo,
    cleanup: cleanupExpiredEntries,
  };
}
