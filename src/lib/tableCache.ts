/**
 * Advanced caching system for CustomDataTable
 * Provides intelligent caching, request deduplication, and cache invalidation
 */

export interface CacheEntry<T = any> {
  key: string;
  data: T[];
  total: number;
  timestamp: number;
  filters: Record<string, any>;
  sort: { field?: string; direction?: "asc" | "desc" };
  etag?: string;
  lastModified?: string;
  accessCount: number;
  lastAccessed: number;
}

export interface CacheConfig {
  maxSize: number;
  ttl: number; // Time to live in milliseconds
  enableEtag: boolean;
  enableCompression: boolean;
  persistToStorage: boolean;
  storageKey: string;
}

export class TableCache {
  private cache = new Map<string, CacheEntry>();
  private pendingRequests = new Map<string, Promise<any>>();
  private config: CacheConfig;
  private cleanupInterval?: NodeJS.Timeout;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 100,
      ttl: 5 * 60 * 1000, // 5 minutes
      enableEtag: true,
      enableCompression: false,
      persistToStorage: false,
      storageKey: "table-cache",
      ...config,
    };

    // Start cleanup interval
    this.startCleanup();

    // Load from storage if enabled
    if (this.config.persistToStorage && typeof window !== "undefined") {
      this.loadFromStorage();
    }
  }

  /**
   * Get cached data if available and valid
   */
  get<T = any>(key: string): CacheEntry<T> | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    // Check if entry is expired
    if (Date.now() - entry.timestamp > this.config.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    return entry as CacheEntry<T>;
  }

  /**
   * Set cache entry with intelligent eviction
   */
  set<T = any>(
    key: string,
    data: T[],
    total: number,
    filters: Record<string, any>,
    sort: { field?: string; direction?: "asc" | "desc" },
    metadata?: { etag?: string; lastModified?: string }
  ): void {
    const entry: CacheEntry<T> = {
      key,
      data,
      total,
      timestamp: Date.now(),
      filters,
      sort,
      etag: metadata?.etag,
      lastModified: metadata?.lastModified,
      accessCount: 1,
      lastAccessed: Date.now(),
    };

    this.cache.set(key, entry);

    // Evict old entries if cache is full
    this.evictIfNeeded();

    // Persist to storage if enabled
    if (this.config.persistToStorage && typeof window !== "undefined") {
      this.saveToStorage();
    }
  }

  /**
   * Check if a request is already pending
   */
  hasPendingRequest(key: string): boolean {
    return this.pendingRequests.has(key);
  }

  /**
   * Get pending request promise
   */
  getPendingRequest<T = any>(key: string): Promise<T> | null {
    return this.pendingRequests.get(key) || null;
  }

  /**
   * Set pending request
   */
  setPendingRequest<T = any>(key: string, promise: Promise<T>): void {
    this.pendingRequests.set(key, promise);
    // Clean up when promise resolves/rejects
    promise.finally(() => {
      this.pendingRequests.delete(key);
    });
  }

  /**
   * Invalidate cache entries based on patterns
   */
  invalidate(pattern?: string | RegExp): void {
    if (!pattern) {
      // Clear all cache
      this.cache.clear();
      this.pendingRequests.clear();
      return;
    }

    const keysToDelete: string[] = [];
    for (const key of this.cache.keys()) {
      if (typeof pattern === "string") {
        if (key.includes(pattern)) {
          keysToDelete.push(key);
        }
      } else if (pattern instanceof RegExp) {
        if (pattern.test(key)) {
          keysToDelete.push(key);
        }
      }
    }

    keysToDelete.forEach((key) => {
      this.cache.delete(key);
      this.pendingRequests.delete(key);
    });

    if (this.config.persistToStorage && typeof window !== "undefined") {
      this.saveToStorage();
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const entries = Array.from(this.cache.values());
    const now = Date.now();

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      pendingRequests: this.pendingRequests.size,
      hitRate: this.calculateHitRate(),
      averageAge:
        entries.length > 0
          ? entries.reduce((sum, entry) => sum + (now - entry.timestamp), 0) /
            entries.length
          : 0,
      totalAccessCount: entries.reduce(
        (sum, entry) => sum + entry.accessCount,
        0
      ),
      oldestEntry:
        entries.length > 0
          ? Math.min(...entries.map((entry) => entry.timestamp))
          : null,
      newestEntry:
        entries.length > 0
          ? Math.max(...entries.map((entry) => entry.timestamp))
          : null,
    };
  }

  /**
   * Export cache for debugging
   */
  export(): Record<string, any> {
    const entries: Record<string, any> = {};
    for (const [key, entry] of this.cache.entries()) {
      entries[key] = {
        ...entry,
        dataSize: entry.data.length,
        age: Date.now() - entry.timestamp,
      };
    }

    return {
      entries,
      stats: this.getStats(),
      config: this.config,
    };
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.config.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));

    if (
      keysToDelete.length > 0 &&
      this.config.persistToStorage &&
      typeof window !== "undefined"
    ) {
      this.saveToStorage();
    }
  }

  /**
   * Evict entries when cache is full using LRU strategy
   */
  private evictIfNeeded(): void {
    if (this.cache.size <= this.config.maxSize) {
      return;
    }

    // Sort by last accessed time (LRU)
    const entries = Array.from(this.cache.entries()).sort(
      ([, a], [, b]) => a.lastAccessed - b.lastAccessed
    );

    // Remove oldest entries
    const toRemove = this.cache.size - this.config.maxSize;
    for (let i = 0; i < toRemove; i++) {
      const [key] = entries[i];
      this.cache.delete(key);
    }
  }

  /**
   * Calculate cache hit rate
   */
  private calculateHitRate(): number {
    const entries = Array.from(this.cache.values());
    if (entries.length === 0) return 0;

    const totalAccess = entries.reduce(
      (sum, entry) => sum + entry.accessCount,
      0
    );
    return totalAccess > 0 ? (entries.length / totalAccess) * 100 : 0;
  }

  /**
   * Start cleanup interval
   */
  private startCleanup(): void {
    if (typeof window === "undefined") return;

    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.config.ttl / 2); // Clean up every half TTL
  }

  /**
   * Stop cleanup interval
   */
  private stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
  }

  /**
   * Load cache from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        const now = Date.now();

        // Only load non-expired entries
        for (const [key, entry] of Object.entries(parsed)) {
          const cacheEntry = entry as CacheEntry;
          if (now - cacheEntry.timestamp < this.config.ttl) {
            this.cache.set(key, cacheEntry);
          }
        }
      }
    } catch (error) {
      console.warn("Failed to load cache from storage:", error);
    }
  }

  /**
   * Save cache to localStorage
   */
  private saveToStorage(): void {
    try {
      const cacheObject: Record<string, CacheEntry> = {};
      for (const [key, entry] of this.cache.entries()) {
        cacheObject[key] = entry;
      }
      localStorage.setItem(this.config.storageKey, JSON.stringify(cacheObject));
    } catch (error) {
      console.warn("Failed to save cache to storage:", error);
    }
  }

  /**
   * Destroy cache and cleanup
   */
  destroy(): void {
    this.stopCleanup();
    this.cache.clear();
    this.pendingRequests.clear();

    if (this.config.persistToStorage && typeof window !== "undefined") {
      try {
        localStorage.removeItem(this.config.storageKey);
      } catch (error) {
        console.warn("Failed to remove cache from storage:", error);
      }
    }
  }
}

// Global cache instance
export const globalTableCache = new TableCache({
  maxSize: 50,
  ttl: 5 * 60 * 1000, // 5 minutes
  enableEtag: true,
  persistToStorage: true,
  storageKey: "custom-datatable-cache",
});

// Cache management utilities
export const cacheUtils = {
  /**
   * Generate cache key from parameters
   */
  generateKey(endpoint: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as Record<string, any>);

    return `${endpoint}:${JSON.stringify(sortedParams)}`;
  },

  /**
   * Invalidate cache for specific endpoint
   */
  invalidateEndpoint(endpoint: string): void {
    globalTableCache.invalidate(endpoint);
  },

  /**
   * Get cache statistics
   */
  getStats() {
    return globalTableCache.getStats();
  },

  /**
   * Export cache for debugging
   */
  exportCache() {
    return globalTableCache.export();
  },
};
