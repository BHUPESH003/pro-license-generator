"use client";

import { useRef, useCallback, useEffect } from "react";

interface PerformanceMetrics {
  renderCount: number;
  averageRenderTime: number;
  slowestRender: number;
  fastestRender: number;
  totalRenderTime: number;
  memoryUsage?: {
    used: number;
    total: number;
    percentage: number;
  };
  apiMetrics: {
    totalCalls: number;
    averageResponseTime: number;
    slowestCall: number;
    fastestCall: number;
    errorRate: number;
  };
  cacheMetrics: {
    hitRate: number;
    size: number;
    evictions: number;
  };
  userInteractions: {
    clicks: number;
    searches: number;
    filters: number;
    sorts: number;
    pageChanges: number;
  };
}

interface PerformanceEntry {
  timestamp: number;
  duration: number;
  type: "render" | "api" | "interaction";
  details?: any;
}

export function usePerformanceMonitor(enabled: boolean = false) {
  const metricsRef = useRef<PerformanceMetrics>({
    renderCount: 0,
    averageRenderTime: 0,
    slowestRender: 0,
    fastestRender: Infinity,
    totalRenderTime: 0,
    apiMetrics: {
      totalCalls: 0,
      averageResponseTime: 0,
      slowestCall: 0,
      fastestCall: Infinity,
      errorRate: 0,
    },
    cacheMetrics: {
      hitRate: 0,
      size: 0,
      evictions: 0,
    },
    userInteractions: {
      clicks: 0,
      searches: 0,
      filters: 0,
      sorts: 0,
      pageChanges: 0,
    },
  });

  const entriesRef = useRef<PerformanceEntry[]>([]);
  const renderStartRef = useRef<number>(0);
  const apiCallsRef = useRef<Map<string, { start: number; success: boolean }>>(
    new Map()
  );

  // Start render timing
  const startRenderTiming = useCallback(() => {
    if (!enabled) return;
    renderStartRef.current = performance.now();
  }, [enabled]);

  // End render timing
  const endRenderTiming = useCallback(() => {
    if (!enabled || renderStartRef.current === 0) return;

    const duration = performance.now() - renderStartRef.current;
    const metrics = metricsRef.current;

    metrics.renderCount++;
    metrics.totalRenderTime += duration;
    metrics.averageRenderTime = metrics.totalRenderTime / metrics.renderCount;
    metrics.slowestRender = Math.max(metrics.slowestRender, duration);
    metrics.fastestRender = Math.min(metrics.fastestRender, duration);

    entriesRef.current.push({
      timestamp: Date.now(),
      duration,
      type: "render",
    });

    // Keep only last 100 entries
    if (entriesRef.current.length > 100) {
      entriesRef.current = entriesRef.current.slice(-100);
    }

    renderStartRef.current = 0;
  }, [enabled]);

  // Track API call start
  const trackApiCallStart = useCallback(
    (callId: string) => {
      if (!enabled) return;

      apiCallsRef.current.set(callId, {
        start: performance.now(),
        success: false,
      });
    },
    [enabled]
  );

  // Track API call end
  const trackApiCallEnd = useCallback(
    (callId: string, success: boolean = true) => {
      if (!enabled) return;

      const call = apiCallsRef.current.get(callId);
      if (!call) return;

      const duration = performance.now() - call.start;
      const metrics = metricsRef.current.apiMetrics;

      metrics.totalCalls++;
      const totalTime =
        metrics.averageResponseTime * (metrics.totalCalls - 1) + duration;
      metrics.averageResponseTime = totalTime / metrics.totalCalls;
      metrics.slowestCall = Math.max(metrics.slowestCall, duration);
      metrics.fastestCall = Math.min(metrics.fastestCall, duration);

      if (!success) {
        metrics.errorRate =
          (metrics.errorRate * (metrics.totalCalls - 1) + 1) /
          metrics.totalCalls;
      } else {
        metrics.errorRate =
          (metrics.errorRate * (metrics.totalCalls - 1)) / metrics.totalCalls;
      }

      entriesRef.current.push({
        timestamp: Date.now(),
        duration,
        type: "api",
        details: { success, callId },
      });

      apiCallsRef.current.delete(callId);
    },
    [enabled]
  );

  // Track user interactions
  const trackInteraction = useCallback(
    (type: keyof PerformanceMetrics["userInteractions"]) => {
      if (!enabled) return;

      metricsRef.current.userInteractions[type]++;

      entriesRef.current.push({
        timestamp: Date.now(),
        duration: 0,
        type: "interaction",
        details: { interactionType: type },
      });
    },
    [enabled]
  );

  // Update cache metrics
  const updateCacheMetrics = useCallback(
    (hitRate: number, size: number, evictions: number) => {
      if (!enabled) return;

      metricsRef.current.cacheMetrics = {
        hitRate,
        size,
        evictions,
      };
    },
    [enabled]
  );

  // Get memory usage (if available)
  const getMemoryUsage = useCallback(() => {
    if (!enabled || !(performance as any).memory) return null;

    const memory = (performance as any).memory;
    return {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
      percentage: Math.round(
        (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
      ),
    };
  }, [enabled]);

  // Get current metrics
  const getMetrics = useCallback((): PerformanceMetrics => {
    const memoryUsage = getMemoryUsage();
    return {
      ...metricsRef.current,
      memoryUsage: memoryUsage || undefined,
    };
  }, [getMemoryUsage]);

  // Get performance entries
  const getEntries = useCallback(() => {
    return [...entriesRef.current];
  }, []);

  // Clear metrics
  const clearMetrics = useCallback(() => {
    metricsRef.current = {
      renderCount: 0,
      averageRenderTime: 0,
      slowestRender: 0,
      fastestRender: Infinity,
      totalRenderTime: 0,
      apiMetrics: {
        totalCalls: 0,
        averageResponseTime: 0,
        slowestCall: 0,
        fastestCall: Infinity,
        errorRate: 0,
      },
      cacheMetrics: {
        hitRate: 0,
        size: 0,
        evictions: 0,
      },
      userInteractions: {
        clicks: 0,
        searches: 0,
        filters: 0,
        sorts: 0,
        pageChanges: 0,
      },
    };
    entriesRef.current = [];
    apiCallsRef.current.clear();
  }, []);

  // Export metrics to JSON
  const exportMetrics = useCallback(() => {
    const metrics = getMetrics();
    const entries = getEntries();

    const exportData = {
      timestamp: new Date().toISOString(),
      metrics,
      entries,
      browser: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `table-performance-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [getMetrics, getEntries]);

  // Performance warnings
  const getWarnings = useCallback(() => {
    const metrics = getMetrics();
    const warnings: string[] = [];

    if (metrics.renderCount > 100) {
      warnings.push(
        `High render count: ${metrics.renderCount} renders detected`
      );
    }

    if (metrics.averageRenderTime > 16) {
      warnings.push(
        `Slow renders: Average render time is ${metrics.averageRenderTime.toFixed(
          2
        )}ms (target: <16ms)`
      );
    }

    if (metrics.apiMetrics.averageResponseTime > 2000) {
      warnings.push(
        `Slow API calls: Average response time is ${metrics.apiMetrics.averageResponseTime.toFixed(
          0
        )}ms`
      );
    }

    if (metrics.apiMetrics.errorRate > 0.1) {
      warnings.push(
        `High API error rate: ${(metrics.apiMetrics.errorRate * 100).toFixed(
          1
        )}%`
      );
    }

    if (metrics.cacheMetrics.hitRate < 0.5 && metrics.cacheMetrics.size > 0) {
      warnings.push(
        `Low cache hit rate: ${(metrics.cacheMetrics.hitRate * 100).toFixed(
          1
        )}%`
      );
    }

    if (metrics.memoryUsage && metrics.memoryUsage.percentage > 80) {
      warnings.push(
        `High memory usage: ${metrics.memoryUsage.percentage}% of heap used`
      );
    }

    return warnings;
  }, [getMetrics]);

  // Auto-start render timing on component mount
  useEffect(() => {
    if (enabled) {
      startRenderTiming();
      return () => {
        endRenderTiming();
      };
    }
  }, [enabled, startRenderTiming, endRenderTiming]);

  return {
    startRenderTiming,
    endRenderTiming,
    trackApiCallStart,
    trackApiCallEnd,
    trackInteraction,
    updateCacheMetrics,
    getMetrics,
    getEntries,
    clearMetrics,
    exportMetrics,
    getWarnings,
    enabled,
  };
}
