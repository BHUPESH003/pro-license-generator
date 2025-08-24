import React from "react";
import type { ButtonProps } from "./Button";

// Core data interfaces
export interface TableResponse<T> {
  success: boolean;
  message?: string;
  data: {
    rows: T[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface TableRequest {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  filters?: Record<string, any>;
  export?: "csv";
}

// Column configuration
export interface DataTableColumn {
  field: string;
  headerName: string;

  // Display
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  align?: "left" | "center" | "right";

  // Behavior
  sortable?: boolean;
  resizable?: boolean;
  pinned?: "left" | "right";

  // Rendering
  cellRenderer?: (value: any, row: any) => React.ReactNode;
  valueFormatter?: (value: any) => string;
  valueGetter?: (row: any) => any;

  // Styling
  headerClassName?: string;
  cellClassName?: string | ((value: any, row: any) => string);
}

// Filter configuration
export interface FilterConfig {
  field: string;
  type: "text" | "select" | "date" | "dateRange" | "number";
  label: string;

  // Configuration
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  debounceMs?: number; // Default: 300 for text, 0 for others

  // Validation
  validator?: (value: any) => boolean;

  // Rendering
  width?: string;
  className?: string;
}

// Action configuration
export interface ActionConfig<T> {
  label: string;
  onClick: (row: T) => void;

  // Styling
  variant?: ButtonProps["variant"];
  icon?: React.ReactNode;

  // Conditional rendering and behavior
  disabled?: (row: T) => boolean;
  hidden?: (row: T) => boolean;

  // Legacy support (deprecated - use hidden instead)
  condition?: (row: T) => boolean;

  // Accessibility
  tooltip?: string;
  ariaLabel?: string;
}

// Main component props
export interface CustomDataTableProps<T = Record<string, unknown>> {
  // Data Configuration
  endpoint: string;
  columns: DataTableColumn[];

  // Feature Configuration
  filters?: FilterConfig[];
  actions?: ActionConfig<any>[];
  defaultSort?: { field: string; direction: "asc" | "desc" };

  // Display Configuration
  pageSize?: number;
  exportEnabled?: boolean;
  selectionEnabled?: boolean;
  searchEnabled?: boolean;

  // Styling
  className?: string;
  height?: string | number;

  // Event Handlers
  onRowClick?: (row: any) => void;
  onRowSelect?: (selectedRows: any[]) => void;
  onFiltersChange?: (filters: Record<string, unknown>) => void;
  onExport?: (data: any[]) => void;

  // Advanced Configuration
  virtualScrolling?: boolean;
  stickyHeader?: boolean;
  debugMode?: boolean;
}

// Table state interfaces
export interface CustomTableState {
  // Data State
  data: any[];
  loading: boolean;
  error: string | null;
  total: number;

  // Pagination State
  page: number;
  pageSize: number;
  totalPages: number;

  // Sorting State
  sortBy?: string;
  sortDir?: "asc" | "desc";

  // Filter State
  filters: Record<string, any>;
  localFilters: Record<string, any>; // For immediate UI updates

  // Selection State
  selectedRows: Set<string>;

  // Search State
  globalSearch: string;
}

// Hook options
export interface UseCustomTableStateOptions {
  endpoint: string;
  defaultPageSize?: number;
  defaultSort?: { field: string; direction: "asc" | "desc" };
  cacheTimeout?: number; // Default: 5 minutes
  debugMode?: boolean;
}

// Cache interface
export interface TableCache<T> {
  key: string;
  data: T[];
  total: number;
  timestamp: number;
  filters: Record<string, any>;
  sort: { field?: string; direction?: "asc" | "desc" };
}

// Filter state
export interface FilterState {
  applied: Record<string, any>; // Filters applied to API
  pending: Record<string, any>; // Filters pending API call
  local: Record<string, any>; // Local filters for immediate UI
}

// Debug info
export interface DebugInfo {
  apiCalls: Array<{ timestamp: number; url: string; params: any }>;
  renderCount: number;
  cacheHits: number;
  cacheMisses: number;
  errorCount: number;
}

// Export options
export interface ExportOptions {
  filename?: string;
  includeHeaders?: boolean;
  selectedRowsOnly?: boolean;
}
