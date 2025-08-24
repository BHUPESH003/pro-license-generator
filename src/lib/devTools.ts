/**
 * Development tools and utilities for CustomDataTable
 * Provides debugging, profiling, and development assistance
 */
import { globalTableCache, cacheUtils } from "./tableCache";
import { requestOptimizer, requestUtils } from "./requestOptimizer";

export interface DevToolsConfig {
  enabled: boolean;
  logLevel: "none" | "error" | "warn" | "info" | "debug";
  enablePerformanceMonitoring: boolean;
  enableNetworkLogging: boolean;
  enableStateLogging: boolean;
  maxLogEntries: number;
}

export interface LogEntry {
  timestamp: number;
  level: "error" | "warn" | "info" | "debug";
  category: string;
  message: string;
  data?: any;
  stack?: string;
}

export interface PerformanceEntry {
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  metadata?: any;
}

class DevTools {
  private config: DevToolsConfig;
  private logs: LogEntry[] = [];
  private performanceEntries: PerformanceEntry[] = [];
  private activeTimers = new Map<string, number>();

  constructor(config: Partial<DevToolsConfig> = {}) {
    this.config = {
      enabled: process.env.NODE_ENV === "development",
      logLevel: "info",
      enablePerformanceMonitoring: true,
      enableNetworkLogging: true,
      enableStateLogging: true,
      maxLogEntries: 1000,
      ...config,
    };

    if (this.config.enabled) {
      this.setupGlobalErrorHandling();
      this.exposeToWindow();
    }
  }

  /**
   * Log message with specified level
   */
  log(
    level: LogEntry["level"],
    category: string,
    message: string,
    data?: any
  ): void {
    if (!this.config.enabled) return;

    const levelPriority = { none: 0, error: 1, warn: 2, info: 3, debug: 4 };
    if (levelPriority[level] > levelPriority[this.config.logLevel]) return;

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      category,
      message,
      data,
      stack: level === "error" ? new Error().stack : undefined,
    };

    this.logs.push(entry);

    // Trim logs if exceeding max entries
    if (this.logs.length > this.config.maxLogEntries) {
      this.logs = this.logs.slice(-this.config.maxLogEntries);
    }

    // Console output with styling
    const styles = {
      error: "color: #ef4444; font-weight: bold;",
      warn: "color: #f59e0b; font-weight: bold;",
      info: "color: #3b82f6;",
      debug: "color: #6b7280;",
    };

    console.log(`%c[${category}] ${message}`, styles[level], data ? data : "");
  }

  /**
   * Start performance timer
   */
  startTimer(name: string, metadata?: any): void {
    if (!this.config.enabled || !this.config.enablePerformanceMonitoring)
      return;

    this.activeTimers.set(name, performance.now());
    this.log("debug", "Performance", `Timer started: ${name}`, metadata);
  }

  /**
   * End performance timer
   */
  endTimer(name: string, metadata?: any): number | null {
    if (!this.config.enabled || !this.config.enablePerformanceMonitoring)
      return null;

    const startTime = this.activeTimers.get(name);
    if (!startTime) {
      this.log("warn", "Performance", `Timer not found: ${name}`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    const entry: PerformanceEntry = {
      name,
      startTime,
      endTime,
      duration,
      metadata,
    };

    this.performanceEntries.push(entry);
    this.activeTimers.delete(name);

    this.log(
      "debug",
      "Performance",
      `Timer ended: ${name} (${duration.toFixed(2)}ms)`,
      metadata
    );
    return duration;
  }

  /**
   * Profile a function execution
   */
  profile<T>(name: string, fn: () => T, metadata?: any): T {
    if (!this.config.enabled) return fn();

    this.startTimer(name, metadata);
    try {
      const result = fn();
      this.endTimer(name, metadata);
      return result;
    } catch (error) {
      this.endTimer(name, { ...metadata, error: true });
      this.log(
        "error",
        "Performance",
        `Profiled function failed: ${name}`,
        error
      );
      throw error;
    }
  }

  /**
   * Profile async function execution
   */
  async profileAsync<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: any
  ): Promise<T> {
    if (!this.config.enabled) return fn();

    this.startTimer(name, metadata);
    try {
      const result = await fn();
      this.endTimer(name, metadata);
      return result;
    } catch (error) {
      this.endTimer(name, { ...metadata, error: true });
      this.log(
        "error",
        "Performance",
        `Profiled async function failed: ${name}`,
        error
      );
      throw error;
    }
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): any {
    if (!this.config.enabled) return null;

    const entries = this.performanceEntries;
    const groupedByName = entries.reduce((acc, entry) => {
      if (!acc[entry.name]) {
        acc[entry.name] = [];
      }
      acc[entry.name].push(entry);
      return acc;
    }, {} as Record<string, PerformanceEntry[]>);

    const summary = Object.entries(groupedByName).map(([name, entries]) => {
      const durations = entries.map((e) => e.duration);
      return {
        name,
        count: entries.length,
        totalDuration: durations.reduce((sum, d) => sum + d, 0),
        averageDuration:
          durations.reduce((sum, d) => sum + d, 0) / durations.length,
        minDuration: Math.min(...durations),
        maxDuration: Math.max(...durations),
        lastExecution: Math.max(...entries.map((e) => e.endTime)),
      };
    });

    return {
      summary,
      totalEntries: entries.length,
      timeRange:
        entries.length > 0
          ? {
              start: Math.min(...entries.map((e) => e.startTime)),
              end: Math.max(...entries.map((e) => e.endTime)),
            }
          : null,
    };
  }

  /**
   * Get logs with filtering
   */
  getLogs(filter?: {
    level?: LogEntry["level"];
    category?: string;
    since?: number;
    limit?: number;
  }): LogEntry[] {
    let filteredLogs = [...this.logs];

    if (filter) {
      if (filter.level) {
        filteredLogs = filteredLogs.filter((log) => log.level === filter.level);
      }
      if (filter.category) {
        filteredLogs = filteredLogs.filter(
          (log) => log.category === filter.category
        );
      }
      if (filter.since) {
        filteredLogs = filteredLogs.filter(
          (log) => log.timestamp >= filter.since!
        );
      }
      if (filter.limit) {
        filteredLogs = filteredLogs.slice(-filter.limit);
      }
    }

    return filteredLogs;
  }

  /**
   * Export debug data
   */
  exportDebugData(): any {
    return {
      config: this.config,
      logs: this.logs,
      performanceEntries: this.performanceEntries,
      performanceSummary: this.getPerformanceSummary(),
      cacheStats: cacheUtils.getStats(),
      requestMetrics: requestUtils.getPerformanceMetrics(),
      timestamp: Date.now(),
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "N/A",
      url: typeof window !== "undefined" ? window.location.href : "N/A",
    };
  }

  /**
   * Clear all debug data
   */
  clearDebugData(): void {
    this.logs.length = 0;
    this.performanceEntries.length = 0;
    this.activeTimers.clear();
    this.log("info", "DevTools", "Debug data cleared");
  }

  /**
   * Generate performance report
   */
  generatePerformanceReport(): string {
    const summary = this.getPerformanceSummary();
    if (!summary) return "Performance monitoring disabled";

    let report = "# Performance Report\n\n";
    report += `Generated: ${new Date().toISOString()}\n`;
    report += `Total Entries: ${summary.totalEntries}\n\n`;

    if (summary.summary.length > 0) {
      report += "## Performance Summary\n\n";
      report +=
        "| Operation | Count | Total (ms) | Avg (ms) | Min (ms) | Max (ms) |\n";
      report +=
        "|-----------|-------|------------|----------|----------|----------|\n";

      summary.summary
        .sort((a: any, b: any) => b.totalDuration - a.totalDuration)
        .forEach((item: any) => {
          report += `| ${item.name} | ${
            item.count
          } | ${item.totalDuration.toFixed(2)} | ${item.averageDuration.toFixed(
            2
          )} | ${item.minDuration.toFixed(2)} | ${item.maxDuration.toFixed(
            2
          )} |\n`;
        });
    }

    const cacheStats = cacheUtils.getStats();
    report += "\n## Cache Statistics\n\n";
    report += `- Size: ${cacheStats.size}/${cacheStats.maxSize}\n`;
    report += `- Hit Rate: ${cacheStats.hitRate.toFixed(2)}%\n`;
    report += `- Total Access: ${cacheStats.totalAccessCount}\n`;

    return report;
  }

  /**
   * Setup global error handling
   */
  private setupGlobalErrorHandling(): void {
    if (typeof window === "undefined") return;

    const originalError = console.error;
    console.error = (...args) => {
      this.log("error", "Console", "Console error", args);
      originalError.apply(console, args);
    };

    window.addEventListener("error", (event) => {
      this.log("error", "Global", "Unhandled error", {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      });
    });

    window.addEventListener("unhandledrejection", (event) => {
      this.log("error", "Global", "Unhandled promise rejection", {
        reason: event.reason,
      });
    });
  }

  /**
   * Expose dev tools to window for debugging
   */
  private exposeToWindow(): void {
    if (typeof window === "undefined") return;

    (window as any).__CUSTOM_DATATABLE_DEVTOOLS__ = {
      logs: () => this.getLogs(),
      performance: () => this.getPerformanceSummary(),
      export: () => this.exportDebugData(),
      clear: () => this.clearDebugData(),
      report: () => this.generatePerformanceReport(),
      cache: {
        stats: () => cacheUtils.getStats(),
        export: () => cacheUtils.exportCache(),
        clear: () => globalTableCache.invalidate(),
      },
      requests: {
        metrics: () => requestUtils.getPerformanceMetrics(),
        clear: () => requestOptimizer.resetMetrics(),
      },
    };

    this.log(
      "info",
      "DevTools",
      "Development tools exposed to window.__CUSTOM_DATATABLE_DEVTOOLS__"
    );
  }

  /**
   * Get state diff for logging
   */
  private getStateDiff(oldState: any, newState: any): any {
    if (!oldState || !newState) return null;

    const diff: any = {};
    const allKeys = new Set([
      ...Object.keys(oldState),
      ...Object.keys(newState),
    ]);

    for (const key of allKeys) {
      if (oldState[key] !== newState[key]) {
        diff[key] = {
          old: oldState[key],
          new: newState[key],
        };
      }
    }

    return Object.keys(diff).length > 0 ? diff : null;
  }
}

// Global dev tools instance
export const devTools = new DevTools();

// Utility functions
export const devUtils = {
  /**
   * Log state change
   */
  logStateChange: (
    component: string,
    oldState: any,
    newState: any,
    action?: string
  ) => {
    devTools.log(
      "debug",
      "State",
      `${component} state changed${action ? ` (${action})` : ""}`,
      {
        component,
        oldState,
        newState,
        action,
      }
    );
  },

  /**
   * Log network request
   */
  logNetworkRequest: (
    method: string,
    url: string,
    params?: any,
    response?: any,
    error?: any,
    duration?: number
  ) => {
    const level = error ? "error" : "info";
    const message = `${method.toUpperCase()} ${url}${
      duration ? ` (${duration.toFixed(2)}ms)` : ""
    }`;
    devTools.log(level, "Network", message, {
      method,
      url,
      params,
      response: response
        ? { status: response.status, data: response.data }
        : undefined,
      error: error ? error.message : undefined,
      duration,
    });
  },

  /**
   * Profile function execution
   */
  profile: <T>(name: string, fn: () => T, metadata?: any): T => {
    return devTools.profile(name, fn, metadata);
  },

  /**
   * Profile async function execution
   */
  profileAsync: <T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: any
  ): Promise<T> => {
    return devTools.profileAsync(name, fn, metadata);
  },

  /**
   * Export debug data
   */
  exportDebugData: () => {
    return devTools.exportDebugData();
  },

  /**
   * Clear debug data
   */
  clearDebugData: () => {
    devTools.clearDebugData();
  },
};
