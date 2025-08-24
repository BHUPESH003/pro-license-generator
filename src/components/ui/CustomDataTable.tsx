"use client";

import React, { useMemo } from "react";
import { CustomDataTableProps } from "./CustomDataTable.types";
import { useCustomTableState } from "../../hooks/useCustomTableState";
import { useAdminTheme } from "../admin/AdminTheme";
import { TableFilters } from "./TableComponents/TableFilters";
import { TableHeader } from "./TableComponents/TableHeader";
import { TableBody } from "./TableComponents/TableBody";
import { TablePagination } from "./TableComponents/TablePagination";
import { LoadingOverlay } from "./TableComponents/LoadingOverlay";
import { ErrorBoundary } from "./TableComponents/ErrorBoundary";
import { GlobalSearch } from "./TableComponents/GlobalSearch";
import { DebugPanel } from "./TableComponents/DebugPanel";
import { validateTableConfiguration } from "../../utils/developmentWarnings";
import { usePerformanceMonitor } from "../../hooks/usePerformanceMonitor";

export const CustomDataTable = React.memo(function CustomDataTable<
  T = Record<string, unknown>,
>({
  endpoint,
  columns,
  filters = [],
  actions = [],
  defaultSort,
  pageSize = 25,
  exportEnabled = false,
  selectionEnabled = false,
  searchEnabled = false,
  className = "",
  height = "600px",
  onRowClick,
  onRowSelect,
  onFiltersChange,
  onExport,
  virtualScrolling = false,
  stickyHeader = true,
  debugMode = false,
}: CustomDataTableProps<T>) {
  const { isDark } = useAdminTheme();

  // Performance monitoring
  const performanceMonitor = usePerformanceMonitor(debugMode);

  // Validate configuration in development
  React.useEffect(() => {
    if (debugMode) {
      validateTableConfiguration({
        columns,
        filters,
        actions,
        pageSize,
        virtualScrolling,
        debugMode,
        endpoint,
      });
    }
  }, [
    columns,
    filters,
    actions,
    pageSize,
    virtualScrolling,
    debugMode,
    endpoint,
  ]);

  const {
    state,
    updateFilters,
    updateSort,
    updatePagination,
    clearFilters,
    selectRow,
    selectAllRows,
    clearSelection,
    refetch,
    exportToCsv,
    updateGlobalSearch,
  } = useCustomTableState({
    endpoint,
    defaultPageSize: pageSize,
    defaultSort,
    // Reduce aggressiveness of cancellation when interactive features are on
    debugMode,
  });

  // Theme configuration
  const themeConfig = useMemo(
    () => ({
      wrapperClasses: `w-full ${
        isDark ? "dark-table-wrapper" : "light-table-wrapper"
      } ${className}`,
      tableClasses: `border rounded ${
        isDark
          ? "border-[var(--admin-border)] bg-[var(--admin-surface)]"
          : "border-[var(--border)] bg-[var(--surface)]"
      }`,
    }),
    [isDark, className]
  );

  // Handle filter changes - memoized to prevent unnecessary re-renders
  const handleFiltersChange = React.useCallback(
    (newFilters: Record<string, any>) => {
      updateFilters(newFilters);
      if (onFiltersChange) {
        onFiltersChange(newFilters);
      }
    },
    [updateFilters, onFiltersChange]
  );

  // Handle row selection - memoized to prevent unnecessary re-renders
  const handleRowSelect = React.useCallback(() => {
    if (onRowSelect) {
      const selectedData = state.data.filter((row: any) =>
        state.selectedRows.has(row.id || row._id)
      );
      onRowSelect(selectedData);
    }
  }, [onRowSelect, state.data, state.selectedRows]);

  // Update parent when selection changes
  React.useEffect(() => {
    handleRowSelect();
  }, [handleRowSelect]);

  // Handle export - memoized to prevent unnecessary re-renders
  const handleExport = React.useCallback(async () => {
    try {
      const data = await exportToCsv();
      if (onExport) {
        onExport(data);
      }
    } catch (error) {
      console.error("Export failed:", error);
    }
  }, [exportToCsv, onExport]);

  return (
    <ErrorBoundary>
      <div className={themeConfig.wrapperClasses}>
        {/* Global Search */}
        {searchEnabled && (
          <div className="mb-4 flex items-center gap-4">
            <GlobalSearch
              value={state.globalSearch}
              onChange={updateGlobalSearch}
              placeholder="Search across all columns..."
              showResultCount={true}
              resultCount={state.data.length}
              totalCount={state.total}
              onClear={() => updateGlobalSearch("")}
              className="flex-1 max-w-md"
            />
            {state.selectedRows.size > 0 && (
              <div
                className={`text-sm ${
                  isDark
                    ? "text-[var(--admin-muted)]"
                    : "text-[var(--muted-foreground)]"
                }`}
              >
                {state.selectedRows.size} row
                {state.selectedRows.size !== 1 ? "s" : ""} selected
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        {filters.length > 0 && (
          <div className="mb-2 admin-glass">
            <TableFilters
              filters={filters}
              values={state.localFilters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={clearFilters}
              exportEnabled={exportEnabled}
              onExport={handleExport}
              loading={state.loading}
            />
          </div>
        )}

        {/* Table Container */}
        <div
          className={`${themeConfig.tableClasses} relative`}
          style={{
            height: typeof height === "number" ? `${height}px` : height,
          }}
        >
          {/* Loading Overlay */}
          {state.loading && <LoadingOverlay />}

          {/* Table */}
          <div className="overflow-auto h-full">
            <table className="w-full min-w-full">
              <TableHeader
                columns={columns}
                sortBy={state.sortBy}
                sortDir={state.sortDir}
                onSort={updateSort}
                selectionEnabled={selectionEnabled}
                selectedCount={state.selectedRows.size}
                totalCount={state.data.length}
                onSelectAll={selectAllRows}
                stickyHeader={stickyHeader}
              />
              <TableBody
                columns={columns}
                data={state.data}
                actions={actions}
                selectedRows={state.selectedRows}
                onRowClick={onRowClick}
                onRowSelect={selectionEnabled ? selectRow : undefined}
                loading={state.loading}
                error={state.error}
                searchTerm={state.globalSearch}
                highlightSearch={searchEnabled && !!state.globalSearch}
              />
            </table>
          </div>
        </div>

        {/* Pagination */}
        <TablePagination
          page={state.page}
          pageSize={state.pageSize}
          total={state.total}
          totalPages={state.totalPages}
          onPageChange={updatePagination}
          loading={state.loading}
        />

        {/* Debug Panel */}
        {debugMode && (
          <DebugPanel
            debugInfo={{
              ...(state as any).debugInfo,
              performance: {
                averageResponseTime:
                  performanceMonitor.getMetrics().apiMetrics
                    .averageResponseTime,
                slowestRequest:
                  performanceMonitor.getMetrics().apiMetrics.slowestCall,
                fastestRequest:
                  performanceMonitor.getMetrics().apiMetrics.fastestCall,
                totalRequests:
                  performanceMonitor.getMetrics().apiMetrics.totalCalls,
              },
              cache: {
                size: 0,
                maxSize: 100,
                hitRate: 0,
                evictions: 0,
              },
              requests: {
                active: 0,
                queued: 0,
                successful:
                  performanceMonitor.getMetrics().apiMetrics.totalCalls,
                failed: 0,
                deduplicated: 0,
              },
            }}
            tableState={state}
            onClearCache={() => {
              // Clear cache implementation
              refetch();
            }}
            onClearMetrics={() => {
              performanceMonitor.clearMetrics();
            }}
            onExportDebugData={() => {
              performanceMonitor.exportMetrics();
            }}
          />
        )}
      </div>
    </ErrorBoundary>
  );
});

export default CustomDataTable;

// Add display name for better debugging
CustomDataTable.displayName = "CustomDataTable";
