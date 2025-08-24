/**
 * Request optimization utilities for CustomDataTable
 * Handles request deduplication, batching, and intelligent retry logic
 */

import apiClient from "./axios";
import { globalTableCache, cacheUtils } from "./tableCache";

export interface RequestConfig {
  endpoint: string;
  params: Record<string, any>;
  signal?: AbortSignal;
  priority?: "low" | "normal" | "high";
  retryConfig?: RetryConfig;
  cacheConfig?: {
    enabled: boolean;
    ttl?: number;
    key?: string;
  };
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryCondition?: (error: any) => boolean;
}

export interface BatchRequestConfig {
  requests: RequestConfig[];
  maxConcurrency: number;
  batchSize: number;
}

export interface RequestMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  cachedRequests: number;
  averageResponseTime: number;
  retryCount: number;
  deduplicatedRequests: number;
}

class RequestOptimizer {
  private pendingRequests = new Map<string, Promise<any>>();
  private requestQueue: RequestConfig[] = [];
  private isProcessingQueue = false;
  private metrics: RequestMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    cachedRequests: 0,
    averageResponseTime: 0,
    retryCount: 0,
    deduplicatedRequests: 0,
  };

  /**
   * Execute optimized request with caching and deduplication
   */
  async request<T = any>(config: RequestConfig): Promise<T> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      // Generate cache key
      const cacheKey =
        config.cacheConfig?.key ||
        cacheUtils.generateKey(config.endpoint, config.params);

      // Check cache first
      if (config.cacheConfig?.enabled !== false) {
        const cached = globalTableCache.get<T>(cacheKey);
        if (cached) {
          this.metrics.cachedRequests++;
          return {
            success: true,
            data: {
              rows: cached.data,
              total: cached.total,
              page: config.params.page || 1,
              pageSize: config.params.pageSize || 25,
              totalPages: Math.ceil(
                cached.total / (config.params.pageSize || 25)
              ),
            },
          } as T;
        }
      }

      // Check for pending request (deduplication)
      if (this.pendingRequests.has(cacheKey)) {
        this.metrics.deduplicatedRequests++;
        return await this.pendingRequests.get(cacheKey);
      }

      // Create and execute request
      const requestPromise = this.executeRequest<T>(config, cacheKey);
      this.pendingRequests.set(cacheKey, requestPromise);

      const result = await requestPromise;

      // Update metrics
      const responseTime = Date.now() - startTime;
      this.updateResponseTimeMetrics(responseTime);
      this.metrics.successfulRequests++;

      return result;
    } catch (error) {
      this.metrics.failedRequests++;
      throw error;
    } finally {
      // Clean up pending request
      const cacheKey =
        config.cacheConfig?.key ||
        cacheUtils.generateKey(config.endpoint, config.params);
      this.pendingRequests.delete(cacheKey);
    }
  }

  /**
   * Execute batch requests with concurrency control
   */
  async batchRequest<T = any>(config: BatchRequestConfig): Promise<T[]> {
    const results: T[] = [];
    const { requests, maxConcurrency = 3, batchSize = 5 } = config;

    // Process requests in batches
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);

      // Execute batch with concurrency limit
      const batchPromises = batch.map(async (requestConfig, index) => {
        // Add delay for concurrency control
        if (index >= maxConcurrency) {
          await this.delay(100 * Math.floor(index / maxConcurrency));
        }
        return this.request<T>(requestConfig);
      });

      const batchResults = await Promise.allSettled(batchPromises);

      // Process results
      batchResults.forEach((result) => {
        if (result.status === "fulfilled") {
          results.push(result.value);
        } else {
          console.warn("Batch request failed:", result.reason);
        }
      });
    }

    return results;
  }

  /**
   * Add request to queue for later processing
   */
  queueRequest(config: RequestConfig): Promise<any> {
    return new Promise((resolve, reject) => {
      const queuedConfig = {
        ...config,
        resolve,
        reject,
      } as any;

      this.requestQueue.push(queuedConfig);
      this.processQueue();
    });
  }

  /**
   * Prefetch data for anticipated requests
   */
  async prefetch(configs: RequestConfig[]): Promise<void> {
    const prefetchPromises = configs.map((config) =>
      this.request(config).catch((error) => {
        console.warn("Prefetch failed:", error);
        return null;
      })
    );

    await Promise.allSettled(prefetchPromises);
  }

  /**
   * Get request metrics
   */
  getMetrics(): RequestMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      cachedRequests: 0,
      averageResponseTime: 0,
      retryCount: 0,
      deduplicatedRequests: 0,
    };
  }

  /**
   * Clear all pending requests
   */
  clearPendingRequests(): void {
    this.pendingRequests.clear();
    this.requestQueue.length = 0;
  }

  /**
   * Execute individual request with retry logic
   */
  private async executeRequest<T>(
    config: RequestConfig,
    cacheKey: string
  ): Promise<T> {
    const retryConfig: RetryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffFactor: 2,
      retryCondition: (error) => {
        // Retry on network errors and 5xx status codes
        return (
          !error.response ||
          error.response.status >= 500 ||
          error.code === "NETWORK_ERROR"
        );
      },
      ...config.retryConfig,
    };

    let lastError: any;

    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        const response = await apiClient.get(config.endpoint, {
          params: config.params,
          signal: config.signal,
        });

        // Cache successful response
        if (config.cacheConfig?.enabled !== false && response.data.success) {
          const { rows, total } = response.data.data;
          globalTableCache.set(cacheKey, rows, total, config.params, {
            field: config.params.sortBy,
            direction: config.params.sortDir,
          });
        }

        return response.data;
      } catch (error: any) {
        lastError = error;

        // Don't retry if request was aborted
        if (error.name === "AbortError") {
          throw error;
        }

        // Don't retry if condition is not met
        if (!retryConfig.retryCondition!(error)) {
          throw error;
        }

        // Don't retry on last attempt
        if (attempt === retryConfig.maxRetries) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          retryConfig.baseDelay * Math.pow(retryConfig.backoffFactor, attempt),
          retryConfig.maxDelay
        );

        // Add jitter to prevent thundering herd
        const jitteredDelay = delay + Math.random() * 1000;

        await this.delay(jitteredDelay);
        this.metrics.retryCount++;
      }
    }

    throw lastError;
  }

  /**
   * Process queued requests
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    try {
      // Sort queue by priority
      this.requestQueue.sort((a, b) => {
        const priorityOrder = { high: 3, normal: 2, low: 1 };
        return (
          (priorityOrder[b.priority || "normal"] || 2) -
          (priorityOrder[a.priority || "normal"] || 2)
        );
      });

      // Process requests
      while (this.requestQueue.length > 0) {
        const config = this.requestQueue.shift()!;
        try {
          const result = await this.request(config);
          (config as any).resolve(result);
        } catch (error) {
          (config as any).reject(error);
        }
      }
    } finally {
      this.isProcessingQueue = false;
    }
  }

  /**
   * Update average response time metrics
   */
  private updateResponseTimeMetrics(responseTime: number): void {
    const totalRequests =
      this.metrics.successfulRequests + this.metrics.failedRequests;
    this.metrics.averageResponseTime =
      (this.metrics.averageResponseTime * (totalRequests - 1) + responseTime) /
      totalRequests;
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Global request optimizer instance
export const requestOptimizer = new RequestOptimizer();

// Utility functions
export const requestUtils = {
  /**
   * Create optimized request config
   */
  createConfig(
    endpoint: string,
    params: Record<string, any>,
    options: Partial<RequestConfig> = {}
  ): RequestConfig {
    return {
      endpoint,
      params,
      priority: "normal",
      cacheConfig: { enabled: true },
      ...options,
    };
  },

  /**
   * Create batch request config
   */
  createBatchConfig(
    requests: RequestConfig[],
    options: Partial<BatchRequestConfig> = {}
  ): BatchRequestConfig {
    return {
      requests,
      maxConcurrency: 3,
      batchSize: 5,
      ...options,
    };
  },

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return {
      requestMetrics: requestOptimizer.getMetrics(),
      cacheStats: globalTableCache.getStats(),
    };
  },
};
