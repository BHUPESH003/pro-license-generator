"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "../../lib/agGridSetup"; // Register AG Grid modules
import { ColDef, GridReadyEvent } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { FilterConfig, ActionConfig } from "./types";
import { useTableState } from "./useTableState";
import { useAdminTheme } from "./AdminTheme";
import apiClient from "@/lib/axios";
import { downloadCsv, debounce } from "./utils";

export interface DataTableProps<T = Record<string, unknown>> {
  columns: ColDef[];
  endpoint: string;
  filters?: FilterConfig[];
  defaultSort?: { field: string; direction: "asc" | "desc" };
  actions?: ActionConfig<T>[];
  exportEnabled?: boolean;
  pageSize?: number;
  className?: string;
  onRowClick?: (row: T) => void;
  onFiltersChange?: (filters: Record<string, unknown>) => void;
}

export function DataTable<T = Record<string, unknown>>({
  columns,
  endpoint,
  filters = [],
  defaultSort,
  actions = [],
  exportEnabled = false,
  pageSize = 25,
  className = "",
  onRowClick,
  onFiltersChange,
}: DataTableProps<T>) {
  const gridRef = useRef<AgGridReact>(null);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [rowData, setRowData] = useState<T[]>([]);

  const { isDark } = useAdminTheme();

  const {
    tableState,
    getCurrentFilters,
    clearPendingFilters,
    updateFilters,
    updateSort,
    updatePagination,
    clearFilters,
  } = useTableState({
    defaultPageSize: pageSize,
    defaultSort,
  });

  // Local state for immediate UI updates (especially for text inputs)
  const [localFilters, setLocalFilters] = useState<Record<string, string>>({});

  // Sync local filters with table state filters when they change
  React.useEffect(() => {
    setLocalFilters(tableState.filters);
  }, [tableState.filters]);

  // Theme configuration with fallback
  const getThemeWithFallback = useCallback((isDark: boolean): string => {
    try {
      // Check if dark theme CSS is loaded by looking for the style element
      const adminThemeStyles = document.getElementById("admin-theme-styles");

      if (isDark && !adminThemeStyles) {
        console.warn(
          "Admin dark theme styles not loaded, falling back to light theme"
        );
        return "ag-theme-alpine";
      }

      return isDark ? "ag-theme-alpine-dark" : "ag-theme-alpine";
    } catch (error) {
      console.error("Theme detection error:", error);
      return "ag-theme-alpine"; // Safe fallback
    }
  }, []);

  // Theme configuration
  const themeConfig = useMemo(
    () => ({
      agGridTheme: getThemeWithFallback(isDark),
      wrapperClasses: `w-full ${
        isDark ? "dark-table-wrapper" : "light-table-wrapper"
      } ${className}`,
    }),
    [isDark, className, getThemeWithFallback]
  );

  // Notification system for user feedback
  const showNotification = useCallback(
    (message: string, type: "error" | "warning" | "info" = "error") => {
      // Simple console-based notification for now
      console.log(`[${type.toUpperCase()}] ${message}`);
    },
    []
  );

  // Grid ready handler
  const onGridReady = useCallback(
    (params: GridReadyEvent) => {
      // Apply initial sorting if specified
      if (tableState.sortBy && tableState.sortDir) {
        params.api.applyColumnState({
          state: [
            {
              colId: tableState.sortBy,
              sort: tableState.sortDir,
            },
          ],
        });
      }
    },
    [tableState.sortBy, tableState.sortDir]
  );

  // Track the last API call to prevent duplicates
  const lastApiCallRef = useRef<string>("");

  // Create a stable key for when we need to refetch data
  const dataFetchKey = useMemo(() => {
    return JSON.stringify({
      endpoint,
      page: tableState.page,
      sortBy: tableState.sortBy,
      sortDir: tableState.sortDir,
      filters: tableState.filters,
      pageSize,
    });
  }, [
    endpoint,
    tableState.page,
    tableState.sortBy,
    tableState.sortDir,
    tableState.filters,
    pageSize,
  ]);

  // Fetch data when the key changes
  React.useEffect(() => {
    const loadData = async () => {
      // Use current filters (including pending ones) - call function directly
      const currentFilters = getCurrentFilters();

      // Create the actual API call key to prevent duplicates
      const apiCallKey = JSON.stringify({
        endpoint,
        page: tableState.page,
        sortBy: tableState.sortBy,
        sortDir: tableState.sortDir,
        filters: currentFilters, // Use the actual filters for the API call
        pageSize,
      });

      // Prevent duplicate API calls
      if (lastApiCallRef.current === apiCallKey) {
        console.log("Skipping duplicate API call:", apiCallKey);
        return;
      }

      lastApiCallRef.current = apiCallKey;
      setLoading(true);

      try {
        const queryParams = new URLSearchParams();

        // Pagination
        queryParams.set("page", tableState.page.toString());
        queryParams.set("pageSize", pageSize.toString());

        // Sorting
        if (tableState.sortBy && tableState.sortDir) {
          queryParams.set("sortBy", tableState.sortBy);
          queryParams.set("sortDir", tableState.sortDir);
        }

        // Filtering - use current filters instead of tableState.filters
        Object.entries(currentFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.set(`filter_${key}`, value.toString());
          }
        });

        console.log("Fetching data with current filters:", currentFilters);

        const { data } = await apiClient.get(`${endpoint}`, {
          params: Object.fromEntries(queryParams.entries()),
        });

        if (!data.success) {
          throw new Error(data.message || "Failed to fetch data");
        }

        setRowData(data.data.rows);
        setTotalRows(data.data.total);

        // Clear pending filters after successful fetch - call function directly
        clearPendingFilters();
      } catch (error) {
        console.error("Error fetching data:", error);
        // Reset to known good state - call function directly
        clearPendingFilters();
        // Show user notification
        showNotification("Filter update failed, retrying...", "warning");
        setRowData([]);
        setTotalRows(0);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataFetchKey]); // Only depend on the stable key

  // Debounced filter update function for text inputs
  const debouncedFilterUpdate = useMemo(
    () =>
      debounce((field: string, value: any) => {
        const currentFilters = getCurrentFilters();
        const newFilters = { ...currentFilters, [field]: value };
        updateFilters(newFilters);
        updatePagination(1); // Reset to first page when filtering

        // Notify parent component of filter changes
        if (onFiltersChange) {
          onFiltersChange(newFilters);
        }
      }, 300),
    [getCurrentFilters, updateFilters, updatePagination, onFiltersChange]
  );

  // Cleanup debounced function on unmount
  React.useEffect(() => {
    return () => {
      if (debouncedFilterUpdate.cancel) {
        debouncedFilterUpdate.cancel();
      }
    };
  }, [debouncedFilterUpdate]);

  // Handle filter changes with debouncing for text inputs
  const handleFilterChange = useCallback(
    (field: string, value: any) => {
      const currentFilters = getCurrentFilters();

      // For text inputs, use debounced updates
      if (
        typeof value === "string" &&
        filters.find((f) => f.field === field)?.type === "text"
      ) {
        debouncedFilterUpdate(field, value);
      } else {
        // For selects and dates, update immediately
        const newFilters = { ...currentFilters, [field]: value };
        updateFilters(newFilters);
        updatePagination(1); // Reset to first page when filtering

        // Notify parent component of filter changes
        if (onFiltersChange) {
          onFiltersChange(newFilters);
        }
      }
    },
    [
      getCurrentFilters,
      debouncedFilterUpdate,
      updateFilters,
      updatePagination,
      onFiltersChange,
      filters,
    ]
  );

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    // Cancel any pending debounced updates
    if (debouncedFilterUpdate.cancel) {
      debouncedFilterUpdate.cancel();
    }

    // Clear local filters immediately
    setLocalFilters({});

    clearFilters();
    updatePagination(1); // Reset to first page when clearing filters

    // Notify parent component of filter changes
    if (onFiltersChange) {
      onFiltersChange({});
    }
  }, [debouncedFilterUpdate, clearFilters, updatePagination, onFiltersChange]);

  // Export to CSV with current filters
  const exportToCsv = useCallback(async () => {
    if (!exportEnabled) return;

    try {
      setLoading(true);

      const queryParams = new URLSearchParams();
      queryParams.set("export", "csv");

      // Use current filters (including pending ones) for export
      const currentFilters = getCurrentFilters();
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.set(`filter_${key}`, value.toString());
        }
      });

      // Include sorting in export
      if (tableState.sortBy && tableState.sortDir) {
        queryParams.set("sortBy", tableState.sortBy);
        queryParams.set("sortDir", tableState.sortDir);
      }

      console.log("Exporting CSV with current filters:", currentFilters);

      const { data } = await apiClient.get(`${endpoint}`, {
        params: Object.fromEntries(queryParams.entries()),
        responseType: "text",
      });
      const csvData = data;
      const filename = `export-${new Date().toISOString().split("T")[0]}.csv`;
      downloadCsv(csvData, filename);
    } catch (error) {
      console.error("Error exporting data:", error);
      showNotification("Export failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }, [
    endpoint,
    exportEnabled,
    getCurrentFilters,
    tableState.sortBy,
    tableState.sortDir,
    showNotification,
  ]);

  // Get action button classes based on variant and theme
  const getActionButtonClasses = useCallback(
    (variant: string | undefined) => {
      const baseClasses =
        "px-2 py-1 text-xs rounded font-medium transition-colors";

      if (variant === "primary") {
        return `${baseClasses} bg-blue-500 hover:bg-blue-600 text-white`;
      } else if (variant === "error") {
        return `${baseClasses} bg-red-500 hover:bg-red-600 text-white`;
      } else {
        return isDark
          ? `${baseClasses} bg-gray-600 hover:bg-gray-500 text-gray-200`
          : `${baseClasses} bg-gray-200 hover:bg-gray-300 text-gray-700`;
      }
    },
    [isDark]
  );

  // Action cell renderer component with proper event handling
  const ActionCellRenderer = useCallback(
    (props: any) => {
      const row = props.data;

      const handleActionClick = (
        e: React.MouseEvent,
        action: ActionConfig<T>
      ) => {
        // Prevent event bubbling to row click
        e.stopPropagation();
        e.preventDefault();

        // Execute action
        action.onClick(row);
      };

      const handleMouseDown = (e: React.MouseEvent) => {
        // Prevent mousedown bubbling as additional safety
        e.stopPropagation();
      };

      return (
        <div
          className="flex gap-2 p-1"
          onClick={(e) => e.stopPropagation()} // Additional safety for container
          onMouseDown={handleMouseDown}
        >
          {actions.map((action, index) => {
            if (action.condition && !action.condition(row)) {
              return null;
            }

            return (
              <button
                key={index}
                className={getActionButtonClasses(action.variant)}
                onClick={(e) => handleActionClick(e, action)}
                onMouseDown={handleMouseDown}
              >
                {action.label}
              </button>
            );
          })}
        </div>
      );
    },
    [actions, getActionButtonClasses]
  );

  // Enhanced columns with actions
  const enhancedColumns = useMemo(() => {
    const cols = [...columns];

    if (actions.length > 0) {
      cols.push({
        headerName: "Actions",
        field: "actions",
        cellRenderer: ActionCellRenderer,
        sortable: false,
        filter: false,
        width: actions.length * 100 + 50,
        pinned: "right",
      });
    }

    return cols;
  }, [columns, actions, ActionCellRenderer]);

  return (
    <div className={themeConfig.wrapperClasses}>
      {/* Filters */}
      {filters.length > 0 && (
        <div
          className={`mb-4 p-4 rounded ${
            isDark
              ? "bg-[var(--admin-surface)] border border-[var(--admin-border)]"
              : "bg-[var(--surface)] border border-[var(--border)]"
          }`}
        >
          <div className="flex flex-wrap gap-4 items-end">
            {filters.map((filter, index) => (
              <div key={`${filter.field}-${index}`} className="flex flex-col">
                <label
                  className={`text-sm font-medium mb-1 ${
                    isDark
                      ? "text-[var(--admin-foreground)]"
                      : "text-[var(--foreground)]"
                  }`}
                >
                  {filter.label}
                </label>
                {filter.type === "text" && (
                  <Input
                    placeholder={filter.placeholder}
                    value={localFilters[filter.field] ?? ""} // Show local filters for immediate UI update
                    onChange={(e) => {
                      // Update local state immediately for UI
                      setLocalFilters((prev) => ({
                        ...prev,
                        [filter.field]: e.target.value,
                      }));
                      // Also call the handler for debounced API updates
                      handleFilterChange(filter.field, e.target.value);
                    }}
                    className="w-48"
                  />
                )}
                {filter.type === "select" && (
                  <select
                    value={localFilters[filter.field] ?? ""}
                    onChange={(e) => {
                      // Update local state immediately for UI
                      setLocalFilters((prev) => ({
                        ...prev,
                        [filter.field]: e.target.value,
                      }));
                      // Also call the handler for immediate API updates (selects are not debounced)
                      handleFilterChange(filter.field, e.target.value);
                    }}
                    className={`w-48 px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                      isDark
                        ? "border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-foreground)] focus:ring-[var(--admin-primary)]"
                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] focus:ring-[var(--primary)]"
                    }`}
                  >
                    <option value="">All</option>
                    {filter.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
                {filter.type === "date" && (
                  <Input
                    type="date"
                    value={localFilters[filter.field] ?? ""}
                    onChange={(e) => {
                      // Update local state immediately for UI
                      setLocalFilters((prev) => ({
                        ...prev,
                        [filter.field]: e.target.value,
                      }));
                      // Also call the handler for immediate API updates (dates are not debounced)
                      handleFilterChange(filter.field, e.target.value);
                    }}
                    className="w-48"
                  />
                )}
              </div>
            ))}
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleClearFilters}>
                Clear Filters
              </Button>
              {exportEnabled && (
                <Button
                  variant="accent"
                  onClick={exportToCsv}
                  disabled={loading}
                >
                  Export CSV
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Data Grid */}
      <div
        className={themeConfig.agGridTheme}
        style={{ height: "600px", width: "100%" }}
      >
        <AgGridReact
          ref={gridRef}
          columnDefs={enhancedColumns}
          rowData={rowData}
          theme="legacy"
          onGridReady={onGridReady}
          onRowClicked={
            onRowClick ? (params) => onRowClick(params.data) : undefined
          }
          onSortChanged={(event) => {
            const sortModel = event.api
              .getColumnState()
              .filter((col) => col.sort);
            if (sortModel.length > 0) {
              const sort = sortModel[0];
              updateSort(sort.colId || "", sort.sort as "asc" | "desc");
            } else {
              updateSort("", "asc");
            }
          }}
          loading={loading}
          pagination={false}
          suppressPaginationPanel={true}
          animateRows={true}
          defaultColDef={{
            sortable: true,
            filter: false, // Disable grid filters since we have custom filters
            resizable: true,
            minWidth: 100,
          }}
          className={`rounded ${
            isDark
              ? "border border-[var(--admin-border)]"
              : "border border-[var(--border)]"
          }`}
        />
      </div>

      {/* Pagination Controls */}
      <div className="mt-4 flex items-center justify-between">
        <div
          className={`text-sm ${
            isDark
              ? "text-[var(--admin-muted)]"
              : "text-[var(--muted-foreground)]"
          }`}
        >
          {loading
            ? "Loading..."
            : `Showing ${rowData.length} of ${totalRows} records`}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => updatePagination(Math.max(1, tableState.page - 1))}
            disabled={tableState.page <= 1 || loading}
          >
            Previous
          </Button>

          <span
            className={`text-sm ${
              isDark
                ? "text-[var(--admin-muted)]"
                : "text-[var(--muted-foreground)]"
            }`}
          >
            Page {tableState.page} of {Math.ceil(totalRows / pageSize)}
          </span>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => updatePagination(tableState.page + 1)}
            disabled={
              tableState.page >= Math.ceil(totalRows / pageSize) || loading
            }
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
