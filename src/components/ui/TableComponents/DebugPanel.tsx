"use client";

import React, { useState, useCallback } from "react";
import { useAdminTheme } from "../../admin/AdminTheme";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  ServerIcon,
  CpuChipIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

interface DebugInfo {
  apiCalls: Array<{
    timestamp: number;
    url: string;
    params: any;
    duration?: number;
    status?: "success" | "error" | "pending";
    error?: string;
  }>;
  renderCount: number;
  cacheHits: number;
  cacheMisses: number;
  errorCount: number;
  performance?: {
    averageResponseTime: number;
    slowestRequest: number;
    fastestRequest: number;
    totalRequests: number;
  };
  cache?: {
    size: number;
    maxSize: number;
    hitRate: number;
    evictions: number;
  };
  requests?: {
    active: number;
    queued: number;
    successful: number;
    failed: number;
    deduplicated: number;
  };
}

interface DebugPanelProps {
  debugInfo: DebugInfo;
  tableState: any;
  onClearCache?: () => void;
  onClearMetrics?: () => void;
  onExportDebugData?: () => void;
}

export const DebugPanel = React.memo(function DebugPanel({
  debugInfo,
  tableState,
  onClearCache,
  onClearMetrics,
  onExportDebugData,
}: DebugPanelProps) {
  const { isDark } = useAdminTheme();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["overview"])
  );
  const [selectedApiCall, setSelectedApiCall] = useState<number | null>(null);

  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  }, []);

  const formatTimestamp = useCallback((timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  }, []);

  const formatDuration = useCallback((duration?: number) => {
    if (!duration) return "N/A";
    return `${duration}ms`;
  }, []);

  const getStatusColor = useCallback(
    (status?: string) => {
      switch (status) {
        case "success":
          return isDark ? "text-green-400" : "text-green-600";
        case "error":
          return isDark ? "text-red-400" : "text-red-600";
        case "pending":
          return isDark ? "text-yellow-400" : "text-yellow-600";
        default:
          return isDark ? "text-gray-400" : "text-gray-600";
      }
    },
    [isDark]
  );

  const panelClasses = `
    mt-4 p-4 rounded-lg border text-xs font-mono
    ${
      isDark
        ? "bg-gray-900 border-gray-700 text-gray-300"
        : "bg-gray-50 border-gray-200 text-gray-700"
    }
  `;

  const sectionClasses = `
    mb-4 p-3 rounded border
    ${isDark ? "bg-gray-800 border-gray-600" : "bg-white border-gray-300"}
  `;

  const buttonClasses = `
    px-3 py-1 text-xs rounded border transition-colors
    ${
      isDark
        ? "border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600"
        : "border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
    }
  `;

  const renderSectionHeader = (
    title: string,
    icon: React.ReactNode,
    section: string
  ) => {
    const isExpanded = expandedSections.has(section);

    return (
      <button
        onClick={() => toggleSection(section)}
        className={`
          flex items-center gap-2 w-full text-left font-semibold mb-2
          ${
            isDark
              ? "text-gray-200 hover:text-white"
              : "text-gray-800 hover:text-black"
          }
        `}
      >
        {isExpanded ? (
          <ChevronDownIcon className="w-4 h-4" />
        ) : (
          <ChevronRightIcon className="w-4 h-4" />
        )}
        {icon}
        {title}
      </button>
    );
  };

  const renderMetricCard = (
    label: string,
    value: string | number,
    color?: string
  ) => (
    <div className={`p-2 rounded ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
      <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
        {label}
      </div>
      <div
        className={`font-bold ${
          color || (isDark ? "text-gray-200" : "text-gray-800")
        }`}
      >
        {value}
      </div>
    </div>
  );

  return (
    <div className={panelClasses}>
      <div className="flex items-center justify-between mb-4">
        <h3
          className={`font-bold text-sm ${
            isDark ? "text-gray-200" : "text-gray-800"
          }`}
        >
          🐛 Debug Panel
        </h3>
        <div className="flex gap-2">
          {onClearCache && (
            <button onClick={onClearCache} className={buttonClasses}>
              Clear Cache
            </button>
          )}
          {onClearMetrics && (
            <button onClick={onClearMetrics} className={buttonClasses}>
              Clear Metrics
            </button>
          )}
          {onExportDebugData && (
            <button onClick={onExportDebugData} className={buttonClasses}>
              Export Data
            </button>
          )}
        </div>
      </div>

      {/* Overview Section */}
      <div className={sectionClasses}>
        {renderSectionHeader(
          "Overview",
          <InformationCircleIcon className="w-4 h-4" />,
          "overview"
        )}
        {expandedSections.has("overview") && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {renderMetricCard("Renders", debugInfo.renderCount)}
            {renderMetricCard("API Calls", debugInfo.apiCalls.length)}
            {renderMetricCard(
              "Cache Hits",
              debugInfo.cacheHits,
              "text-green-500"
            )}
            {renderMetricCard(
              "Cache Misses",
              debugInfo.cacheMisses,
              "text-red-500"
            )}
            {renderMetricCard(
              "Errors",
              debugInfo.errorCount,
              debugInfo.errorCount > 0 ? "text-red-500" : undefined
            )}
            {renderMetricCard("Data Rows", tableState.data?.length || 0)}
            {renderMetricCard("Selected", tableState.selectedRows?.size || 0)}
            {renderMetricCard("Total Records", tableState.total || 0)}
          </div>
        )}
      </div>

      {/* Performance Section */}
      {debugInfo.performance && (
        <div className={sectionClasses}>
          {renderSectionHeader(
            "Performance",
            <ChartBarIcon className="w-4 h-4" />,
            "performance"
          )}
          {expandedSections.has("performance") && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {renderMetricCard(
                "Avg Response",
                `${debugInfo.performance.averageResponseTime.toFixed(0)}ms`
              )}
              {renderMetricCard(
                "Slowest",
                `${debugInfo.performance.slowestRequest}ms`,
                "text-red-500"
              )}
              {renderMetricCard(
                "Fastest",
                `${debugInfo.performance.fastestRequest}ms`,
                "text-green-500"
              )}
              {renderMetricCard(
                "Total Requests",
                debugInfo.performance.totalRequests
              )}
            </div>
          )}
        </div>
      )}

      {/* Cache Section */}
      {debugInfo.cache && (
        <div className={sectionClasses}>
          {renderSectionHeader(
            "Cache",
            <ServerIcon className="w-4 h-4" />,
            "cache"
          )}
          {expandedSections.has("cache") && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {renderMetricCard(
                "Size",
                `${debugInfo.cache.size}/${debugInfo.cache.maxSize}`
              )}
              {renderMetricCard(
                "Hit Rate",
                `${debugInfo.cache.hitRate.toFixed(1)}%`,
                debugInfo.cache.hitRate > 80
                  ? "text-green-500"
                  : debugInfo.cache.hitRate > 50
                  ? "text-yellow-500"
                  : "text-red-500"
              )}
              {renderMetricCard("Evictions", debugInfo.cache.evictions)}
              {renderMetricCard(
                "Usage",
                `${(
                  (debugInfo.cache.size / debugInfo.cache.maxSize) *
                  100
                ).toFixed(1)}%`
              )}
            </div>
          )}
        </div>
      )}

      {/* Request Queue Section */}
      {debugInfo.requests && (
        <div className={sectionClasses}>
          {renderSectionHeader(
            "Requests",
            <CpuChipIcon className="w-4 h-4" />,
            "requests"
          )}
          {expandedSections.has("requests") && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {renderMetricCard(
                "Active",
                debugInfo.requests.active,
                "text-blue-500"
              )}
              {renderMetricCard(
                "Queued",
                debugInfo.requests.queued,
                "text-yellow-500"
              )}
              {renderMetricCard(
                "Successful",
                debugInfo.requests.successful,
                "text-green-500"
              )}
              {renderMetricCard(
                "Failed",
                debugInfo.requests.failed,
                "text-red-500"
              )}
              {renderMetricCard(
                "Deduplicated",
                debugInfo.requests.deduplicated,
                "text-purple-500"
              )}
            </div>
          )}
        </div>
      )}

      {/* API Calls Section */}
      <div className={sectionClasses}>
        {renderSectionHeader(
          "API Calls",
          <ClockIcon className="w-4 h-4" />,
          "apiCalls"
        )}
        {expandedSections.has("apiCalls") && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {debugInfo.apiCalls.length === 0 ? (
              <div
                className={`text-center py-4 ${
                  isDark ? "text-gray-500" : "text-gray-400"
                }`}
              >
                No API calls recorded
              </div>
            ) : (
              debugInfo.apiCalls
                .slice(-10)
                .reverse()
                .map((call, index) => (
                  <div
                    key={index}
                    className={`
                    p-2 rounded border cursor-pointer transition-colors
                    ${
                      selectedApiCall === index
                        ? isDark
                          ? "bg-blue-900 border-blue-600"
                          : "bg-blue-50 border-blue-300"
                        : isDark
                        ? "bg-gray-700 border-gray-600 hover:bg-gray-600"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }
                  `}
                    onClick={() =>
                      setSelectedApiCall(
                        selectedApiCall === index ? null : index
                      )
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={getStatusColor(call.status)}>
                          {call.status === "success"
                            ? "✓"
                            : call.status === "error"
                            ? "✗"
                            : "⏳"}
                        </span>
                        <span className="font-medium">{call.url}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span>{formatTimestamp(call.timestamp)}</span>
                        <span>{formatDuration(call.duration)}</span>
                      </div>
                    </div>

                    {selectedApiCall === index && (
                      <div className="mt-2 pt-2 border-t border-gray-600">
                        <div className="mb-2">
                          <strong>Parameters:</strong>
                          <pre className="mt-1 p-2 bg-gray-800 rounded text-xs overflow-x-auto">
                            {JSON.stringify(call.params, null, 2)}
                          </pre>
                        </div>
                        {call.error && (
                          <div className="mb-2">
                            <strong className="text-red-400">Error:</strong>
                            <div className="mt-1 p-2 bg-red-900 rounded text-xs">
                              {call.error}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        )}
      </div>

      {/* Current State Section */}
      <div className={sectionClasses}>
        {renderSectionHeader(
          "Current State",
          <ExclamationTriangleIcon className="w-4 h-4" />,
          "state"
        )}
        {expandedSections.has("state") && (
          <div className="max-h-64 overflow-y-auto">
            <pre
              className={`text-xs p-3 rounded ${
                isDark ? "bg-gray-800" : "bg-gray-100"
              }`}
            >
              {JSON.stringify(
                {
                  page: tableState.page,
                  pageSize: tableState.pageSize,
                  total: tableState.total,
                  sortBy: tableState.sortBy,
                  sortDir: tableState.sortDir,
                  filters: tableState.filters,
                  globalSearch: tableState.globalSearch,
                  selectedRowsCount: tableState.selectedRows?.size,
                  loading: tableState.loading,
                  error: tableState.error,
                },
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>

      {/* Warnings Section */}
      {(debugInfo.errorCount > 0 || debugInfo.renderCount > 100) && (
        <div className={`${sectionClasses} border-yellow-500`}>
          {renderSectionHeader(
            "Warnings",
            <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />,
            "warnings"
          )}
          {expandedSections.has("warnings") && (
            <div className="space-y-2">
              {debugInfo.errorCount > 0 && (
                <div className="flex items-center gap-2 text-red-500">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  <span>
                    High error count detected ({debugInfo.errorCount} errors)
                  </span>
                </div>
              )}
              {debugInfo.renderCount > 100 && (
                <div className="flex items-center gap-2 text-yellow-500">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  <span>
                    High render count detected ({debugInfo.renderCount} renders)
                    - consider optimization
                  </span>
                </div>
              )}
              {debugInfo.cache && debugInfo.cache.hitRate < 50 && (
                <div className="flex items-center gap-2 text-yellow-500">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  <span>
                    Low cache hit rate ({debugInfo.cache.hitRate.toFixed(1)}%) -
                    consider cache optimization
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default DebugPanel;
