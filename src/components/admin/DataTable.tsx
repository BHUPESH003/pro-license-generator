"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "../../lib/agGridSetup"; // Register AG Grid modules
import { ColDef, GridReadyEvent } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { FilterConfig, ActionConfig, TableResponse } from "./types";
import { useTableState } from "./useTableState";
import apiClient from "@/lib/axios";
import { downloadCsv } from "./utils";

export interface DataTableProps<T = any> {
  columns: ColDef[];
  endpoint: string;
  filters?: FilterConfig[];
  defaultSort?: { field: string; direction: "asc" | "desc" };
  actions?: ActionConfig<T>[];
  exportEnabled?: boolean;
  pageSize?: number;
  className?: string;
  onRowClick?: (row: T) => void;
  onFiltersChange?: (filters: Record<string, any>) => void;
}

export function DataTable<T = any>({
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

  const {
    tableState,
    updateFilters,
    updateSort,
    updatePagination,
    clearFilters,
  } = useTableState({
    defaultPageSize: pageSize,
    defaultSort,
  });

  // Fetch data function
  const fetchData = useCallback(async () => {
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

      // Filtering
      Object.entries(tableState.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.set(`filter_${key}`, value.toString());
        }
      });

      const { data } = await apiClient.get(`${endpoint}`, {
        params: Object.fromEntries(queryParams.entries()),
      });

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch data");
      }

      setRowData(data.data.rows);
      setTotalRows(data.data.total);
    } catch (error) {
      console.error("Error fetching data:", error);
      setRowData([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  }, [endpoint, tableState, pageSize]);

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

  // Fetch data when state changes
  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle filter changes
  const handleFilterChange = useCallback(
    (field: string, value: any) => {
      const newFilters = { ...tableState.filters, [field]: value };
      updateFilters(newFilters);
      updatePagination(1); // Reset to first page when filtering

      // Notify parent component of filter changes
      if (onFiltersChange) {
        onFiltersChange(newFilters);
      }
    },
    [tableState.filters, updateFilters, updatePagination, onFiltersChange]
  );

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    clearFilters();
    updatePagination(1); // Reset to first page when clearing filters

    // Notify parent component of filter changes
    if (onFiltersChange) {
      onFiltersChange({});
    }
  }, [clearFilters, updatePagination, onFiltersChange]);

  // Export to CSV
  const exportToCsv = useCallback(async () => {
    if (!exportEnabled) return;

    try {
      setLoading(true);

      const queryParams = new URLSearchParams();
      queryParams.set("export", "csv");

      // Include current filters
      Object.entries(tableState.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.set(`filter_${key}`, value.toString());
        }
      });

      const { data } = await apiClient.get(`${endpoint}`, {
        params: Object.fromEntries(queryParams.entries()),
        responseType: "text",
      });
      const csvData = data;
      const filename = `export-${new Date().toISOString().split("T")[0]}.csv`;
      downloadCsv(csvData, filename);
    } catch (error) {
      console.error("Error exporting data:", error);
    } finally {
      setLoading(false);
    }
  }, [endpoint, exportEnabled, tableState.filters]);

  // Action cell renderer component
  const ActionCellRenderer = useCallback(
    (props: any) => {
      const row = props.data;

      return (
        <div className="flex gap-2 p-1">
          {actions.map((action, index) => {
            if (action.condition && !action.condition(row)) {
              return null;
            }

            return (
              <button
                key={index}
                className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
                  action.variant === "primary"
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : action.variant === "error"
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick(row);
                }}
              >
                {action.label}
              </button>
            );
          })}
        </div>
      );
    },
    [actions]
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
    <div className={`w-full ${className}`}>
      {/* Filters */}
      {filters.length > 0 && (
        <div className="mb-4 p-4 bg-[var(--surface)] border border-[var(--border)] rounded">
          <div className="flex flex-wrap gap-4 items-end">
            {filters.map((filter, index) => (
              <div key={`${filter.field}-${index}`} className="flex flex-col">
                <label className="text-sm font-medium mb-1 text-[var(--foreground)]">
                  {filter.label}
                </label>
                {filter.type === "text" && (
                  <Input
                    placeholder={filter.placeholder}
                    value={tableState.filters[filter.field] || ""}
                    onChange={(e) =>
                      handleFilterChange(filter.field, e.target.value)
                    }
                    className="w-48"
                  />
                )}
                {filter.type === "select" && (
                  <select
                    value={tableState.filters[filter.field] || ""}
                    onChange={(e) =>
                      handleFilterChange(filter.field, e.target.value)
                    }
                    className="w-48 px-3 py-2 border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
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
                    value={tableState.filters[filter.field] || ""}
                    onChange={(e) =>
                      handleFilterChange(filter.field, e.target.value)
                    }
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
        className="ag-theme-alpine"
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
          className="border border-[var(--border)] rounded"
        />
      </div>

      {/* Pagination Controls */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-[var(--muted-foreground)]">
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

          <span className="text-sm text-[var(--muted-foreground)]">
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
