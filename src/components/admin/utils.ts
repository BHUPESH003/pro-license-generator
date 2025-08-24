import { TableState, TableRequest } from "./types";

/**
 * Parse table state from URL search parameters
 */
export function parseTableStateFromUrl(
  searchParams: URLSearchParams,
  defaultPageSize: number = 25,
  defaultSort?: { field: string; direction: "asc" | "desc" }
): TableState {
  const state: TableState = {
    page: parseInt(searchParams.get("page") || "1"),
    pageSize: parseInt(
      searchParams.get("pageSize") || defaultPageSize.toString()
    ),
    filters: {},
  };

  // Parse sorting
  const sortBy = searchParams.get("sortBy");
  if (sortBy) {
    state.sortBy = sortBy;
    state.sortDir = (searchParams.get("sortDir") as "asc" | "desc") || "asc";
  } else if (defaultSort) {
    state.sortBy = defaultSort.field;
    state.sortDir = defaultSort.direction;
  }

  // Parse filters
  Array.from(searchParams.entries()).forEach(([key, value]) => {
    if (key.startsWith("filter_")) {
      const filterField = key.replace("filter_", "");
      state.filters[filterField] = value;
    }
  });

  return state;
}

/**
 * Convert table state to URL search parameters
 */
export function tableStateToUrlParams(
  state: Partial<TableState>,
  currentParams: URLSearchParams,
  defaultPageSize: number = 25
): URLSearchParams {
  const params = new URLSearchParams(currentParams.toString());

  // Handle page
  if (state.page !== undefined) {
    if (state.page === 1) {
      params.delete("page");
    } else {
      params.set("page", state.page.toString());
    }
  }

  // Handle page size
  if (state.pageSize !== undefined && state.pageSize !== defaultPageSize) {
    params.set("pageSize", state.pageSize.toString());
  }

  // Handle sorting
  if (state.sortBy !== undefined) {
    if (state.sortBy) {
      params.set("sortBy", state.sortBy);
      params.set("sortDir", state.sortDir || "asc");
    } else {
      params.delete("sortBy");
      params.delete("sortDir");
    }
  }

  // Handle filters
  if (state.filters !== undefined) {
    // Remove existing filter params
    Array.from(params.keys()).forEach((key) => {
      if (key.startsWith("filter_")) {
        params.delete(key);
      }
    });

    // Add new filter params
    Object.entries(state.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(`filter_${key}`, value.toString());
      }
    });
  }

  return params;
}

/**
 * Convert table state to API request parameters
 */
export function tableStateToApiRequest(state: TableState): TableRequest {
  const request: TableRequest = {
    page: state.page,
    pageSize: state.pageSize,
  };

  if (state.sortBy) {
    request.sortBy = state.sortBy;
    request.sortDir = state.sortDir;
  }

  if (Object.keys(state.filters).length > 0) {
    request.filters = state.filters;
  }

  return request;
}

/**
 * Download data as CSV file
 */
export function downloadCsv(
  data: string,
  filename: string = "export.csv"
): void {
  const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.URL.revokeObjectURL(url);
}

/**
 * Format date for display in tables
 */
export function formatTableDate(date: string | Date): string {
  if (!date) return "-";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";

  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format currency for display in tables
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD"
): string {
  if (typeof amount !== "number") return "-";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount / 100); // Assuming amounts are in cents
}

/**
 * Format status text for display in tables
 */
export function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/**
 * Get status color class for display in tables
 */
export function getStatusColorClass(status: string): string {
  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-red-100 text-red-800",
    pending: "bg-yellow-100 text-yellow-800",
    expired: "bg-gray-100 text-gray-800",
  };

  return statusColors[status.toLowerCase()] || "bg-gray-100 text-gray-800";
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeout: NodeJS.Timeout;

  const debouncedFunction = (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };

  debouncedFunction.cancel = () => {
    clearTimeout(timeout);
  };

  return debouncedFunction;
}

/**
 * Generate column definitions for common data types
 */
export function createDateColumn(
  field: string,
  headerName: string,
  width: number = 150
) {
  return {
    field,
    headerName,
    width,
    valueFormatter: (params: any) => formatTableDate(params.value),
    sortable: true,
    filter: true,
  };
}

export function createStatusColumn(
  field: string,
  headerName: string,
  width: number = 120
) {
  return {
    field,
    headerName,
    width,
    valueFormatter: (params: any) => formatStatus(params.value),
    sortable: true,
    filter: true,
  };
}

export function createCurrencyColumn(
  field: string,
  headerName: string,
  width: number = 120
) {
  return {
    field,
    headerName,
    width,
    valueFormatter: (params: any) => formatCurrency(params.value),
    sortable: true,
    filter: true,
  };
}
