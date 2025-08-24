"use client";

import { useRef, useCallback } from "react";

interface RequestConfig {
  maxConcurrent: number;
  retryAttempts: number;
  retryDelay: number;
  timeout: number;
  enableDeduplication: boolean;
}

interface PendingRequest {
  promise: Promise<any>;
  timestamp: number;
  abortController: AbortController;
}

interface RequestMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  deduplicatedRequests: number;
  averageResponseTime: number;
  activeRequests: number;
}

export function useRequestOptimization(config: Partial<RequestConfig> = {}) {
  const {
    maxConcurrent = 5,
    retryAttempts = 3,
    retryDelay = 1000,
    timeout = 30000,
    enableDeduplication = true,
  } = config;

  const pendingRequestsRef = useRef<Map<string, PendingRequest>>(new Map());
  const activeRequestsRef = useRef<Set<string>>(new Set());
  const requestQueueRef = useRef<Array<() => Promise<any>>>([]);
  const metricsRef = useRef<RequestMetrics>({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    deduplicatedRequests: 0,
    averageResponseTime: 0,
    activeRequests: 0,
  });

  // Generate request key for deduplication
  const generateRequestKey = useCallback(
    (url: string, params: Record<string, any>): string => {
      const sortedParams = Object.keys(params)
        .sort()
        .reduce((result, key) => {
          result[key] = params[key];
          return result;
        }, {} as Record<string, any>);

      return `${url}:${JSON.stringify(sortedParams)}`;
    },
    []
  );

  // Execute request with retry logic
  const executeWithRetry = useCallback(
    async (
      requestFn: () => Promise<any>,
      attempts: number = retryAttempts
    ): Promise<any> => {
      try {
        return await requestFn();
      } catch (error: any) {
        if (attempts > 0 && !error.name?.includes("Abort")) {
          // Exponential backoff
          const delay = retryDelay * Math.pow(2, retryAttempts - attempts);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return executeWithRetry(requestFn, attempts - 1);
        }
        throw error;
      }
    },
    [retryAttempts, retryDelay]
  );

  // Process request queue
  const processQueue = useCallback(async () => {
    while (
      requestQueueRef.current.length > 0 &&
      activeRequestsRef.current.size < maxConcurrent
    ) {
      const requestFn = requestQueueRef.current.shift();
      if (requestFn) {
        try {
          await requestFn();
        } catch (error) {
          // Queue processing should continue even if individual requests fail
          console.warn("Queued request failed:", error);
        }
      }
    }
  }, [maxConcurrent]);

  // Make optimized request
  const makeRequest = useCallback(
    async <T>(
      url: string,
      params: Record<string, any> = {},
      requestFn: (abortSignal: AbortSignal) => Promise<T>
    ): Promise<T> => {
      const requestKey = generateRequestKey(url, params);
      const startTime = Date.now();

      metricsRef.current.totalRequests++;

      // Check for existing request (deduplication)
      if (enableDeduplication && pendingRequestsRef.current.has(requestKey)) {
        metricsRef.current.deduplicatedRequests++;
        const existingRequest = pendingRequestsRef.current.get(requestKey)!;
        return existingRequest.promise;
      }

      // Check if we need to queue the request
      if (activeRequestsRef.current.size >= maxConcurrent) {
        return new Promise((resolve, reject) => {
          requestQueueRef.current.push(async () => {
            try {
              const result = await makeRequest(url, params, requestFn);
              resolve(result);
            } catch (error) {
              reject(error);
            }
          });
        });
      }

      // Create abort controller with timeout
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => {
        abortController.abort();
      }, timeout);

      // Create the request promise
      const requestPromise = (async (): Promise<T> => {
        try {
          activeRequestsRef.current.add(requestKey);
          metricsRef.current.activeRequests = activeRequestsRef.current.size;

          const result = await executeWithRetry(() =>
            requestFn(abortController.signal)
          );

          const responseTime = Date.now() - startTime;
          const currentAvg = metricsRef.current.averageResponseTime;
          const totalSuccessful = metricsRef.current.successfulRequests;

          metricsRef.current.successfulRequests++;
          metricsRef.current.averageResponseTime =
            (currentAvg * totalSuccessful + responseTime) /
            metricsRef.current.successfulRequests;

          return result;
        } catch (error) {
          metricsRef.current.failedRequests++;
          throw error;
        } finally {
          clearTimeout(timeoutId);
          activeRequestsRef.current.delete(requestKey);
          pendingRequestsRef.current.delete(requestKey);
          metricsRef.current.activeRequests = activeRequestsRef.current.size;

          // Process any queued requests
          processQueue();
        }
      })();

      // Store pending request for deduplication
      if (enableDeduplication) {
        pendingRequestsRef.current.set(requestKey, {
          promise: requestPromise,
          timestamp: startTime,
          abortController,
        });
      }

      return requestPromise;
    },
    [
      generateRequestKey,
      enableDeduplication,
      maxConcurrent,
      timeout,
      executeWithRetry,
      processQueue,
    ]
  );

  // Cancel specific request
  const cancelRequest = useCallback(
    (url: string, params: Record<string, any> = {}) => {
      const requestKey = generateRequestKey(url, params);
      const pendingRequest = pendingRequestsRef.current.get(requestKey);

      if (pendingRequest) {
        pendingRequest.abortController.abort();
        pendingRequestsRef.current.delete(requestKey);
        activeRequestsRef.current.delete(requestKey);
        metricsRef.current.activeRequests = activeRequestsRef.current.size;
      }
    },
    [generateRequestKey]
  );

  // Cancel all pending requests
  const cancelAllRequests = useCallback(() => {
    for (const [key, request] of pendingRequestsRef.current.entries()) {
      request.abortController.abort();
    }

    pendingRequestsRef.current.clear();
    activeRequestsRef.current.clear();
    requestQueueRef.current.length = 0;
    metricsRef.current.activeRequests = 0;
  }, []);

  // Get request metrics
  const getMetrics = useCallback((): RequestMetrics => {
    return { ...metricsRef.current };
  }, []);

  // Check if request is pending
  const isPending = useCallback(
    (url: string, params: Record<string, any> = {}): boolean => {
      const requestKey = generateRequestKey(url, params);
      return pendingRequestsRef.current.has(requestKey);
    },
    [generateRequestKey]
  );

  // Get queue status
  const getQueueStatus = useCallback(() => {
    return {
      active: activeRequestsRef.current.size,
      queued: requestQueueRef.current.length,
      maxConcurrent,
      canMakeRequest: activeRequestsRef.current.size < maxConcurrent,
    };
  }, [maxConcurrent]);

  // Batch multiple requests
  const batchRequests = useCallback(
    async <T>(
      requests: Array<{
        url: string;
        params?: Record<string, any>;
        requestFn: (abortSignal: AbortSignal) => Promise<T>;
      }>
    ): Promise<Array<T | Error>> => {
      const promises = requests.map(({ url, params = {}, requestFn }) =>
        makeRequest(url, params, requestFn).catch((error) => error)
      );

      return Promise.all(promises);
    },
    [makeRequest]
  );

  // Cleanup function
  const cleanup = useCallback(() => {
    cancelAllRequests();
    metricsRef.current = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      deduplicatedRequests: 0,
      averageResponseTime: 0,
      activeRequests: 0,
    };
  }, [cancelAllRequests]);

  return {
    makeRequest,
    cancelRequest,
    cancelAllRequests,
    getMetrics,
    isPending,
    getQueueStatus,
    batchRequests,
    cleanup,
  };
}
