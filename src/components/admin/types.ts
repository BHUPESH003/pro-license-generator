import { ColDef } from "ag-grid-community";

// Common table response interface
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

// Common table request interface
export interface TableRequest {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  filters?: Record<string, any>;
  export?: "csv";
}

// Filter configuration
export interface FilterConfig {
  field: string;
  type: "text" | "select" | "date" | "dateRange";
  label: string;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
}

// Action configuration
export interface ActionConfig<T> {
  label: string;
  onClick: (row: T) => void;
  variant?: "primary" | "secondary" | "error";
  icon?: React.ReactNode;
  condition?: (row: T) => boolean;
}

// Column definition with enhanced typing
export interface DataTableColumn extends ColDef {
  field: string;
  headerName: string;
  sortable?: boolean;
  filter?: boolean;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  pinned?: "left" | "right";
  cellRenderer?: string | ((params: any) => React.ReactNode);
  valueFormatter?: (params: any) => string;
  valueGetter?: (params: any) => any;
}

// Table state for URL persistence
export interface TableState {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  filters: Record<string, any>;
}

// Export options
export interface ExportOptions {
  filename?: string;
  includeHeaders?: boolean;
  selectedRowsOnly?: boolean;
}
