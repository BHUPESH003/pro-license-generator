"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TableState } from "./types";
import { parseTableStateFromUrl, tableStateToUrlParams } from "./utils";

interface UseTableStateOptions {
  defaultPageSize?: number;
  defaultSort?: { field: string; direction: "asc" | "desc" };
}

export function useTableState(options: UseTableStateOptions = {}) {
  const { defaultPageSize = 25, defaultSort } = options;
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL
  const [tableState, setTableState] = useState<TableState>(() =>
    parseTableStateFromUrl(searchParams, defaultPageSize, defaultSort)
  );

  // Separate state for immediate API calls
  const [pendingFilters, setPendingFilters] = useState<Record<string, any>>({});

  // Update URL when state changes
  const updateUrl = useCallback(
    (newState: Partial<TableState>, replace: boolean = true) => {
      const params = tableStateToUrlParams(
        newState,
        searchParams,
        defaultPageSize
      );

      const newUrl = `${window.location.pathname}?${params.toString()}`;

      if (replace) {
        router.replace(newUrl, { scroll: false });
      } else {
        router.push(newUrl, { scroll: false });
      }
    },
    [router, searchParams, defaultPageSize]
  );

  // Update state and URL
  const updateTableState = useCallback(
    (updates: Partial<TableState>) => {
      const newState = { ...tableState, ...updates };
      setTableState(newState);
      updateUrl(updates);
    },
    [tableState, updateUrl]
  );

  // Reset to first page (useful when filters change)
  const resetToFirstPage = useCallback(
    (updates: Partial<TableState> = {}) => {
      const newState = { ...tableState, ...updates, page: 1 };
      setTableState(newState);
      updateUrl({ ...updates, page: 1 });
    },
    [tableState, updateUrl]
  );

  // Get current filters for API calls (uses pending if available)
  const getCurrentFilters = useCallback(() => {
    return Object.keys(pendingFilters).length > 0
      ? pendingFilters
      : tableState.filters;
  }, [pendingFilters, tableState.filters]);

  // Clear pending filters after successful API call
  const clearPendingFilters = useCallback(() => {
    setPendingFilters({});
  }, []);

  // Update filters and reset to first page with immediate effect
  const updateFilters = useCallback(
    (filters: Record<string, any>) => {
      // Update pending filters immediately for API calls
      setPendingFilters(filters);

      // Update table state and URL
      resetToFirstPage({ filters });
    },
    [resetToFirstPage]
  );

  // Update sorting
  const updateSort = useCallback(
    (sortBy: string, sortDir: "asc" | "desc") => {
      updateTableState({ sortBy, sortDir });
    },
    [updateTableState]
  );

  // Update pagination
  const updatePagination = useCallback(
    (page: number, pageSize?: number) => {
      const updates: Partial<TableState> = { page };
      if (pageSize !== undefined) {
        updates.pageSize = pageSize;
      }
      updateTableState(updates);
    },
    [updateTableState]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    setPendingFilters({});
    resetToFirstPage({ filters: {} });
  }, [resetToFirstPage]);

  // Sync state with URL changes (for browser back/forward)
  useEffect(() => {
    const newState = parseTableStateFromUrl(
      searchParams,
      defaultPageSize,
      defaultSort
    );
    setTableState(newState);
    // Clear pending filters when URL changes (browser navigation)
    setPendingFilters({});
  }, [searchParams, defaultPageSize, defaultSort]);

  return {
    tableState,
    getCurrentFilters,
    clearPendingFilters,
    updateTableState,
    updateFilters,
    updateSort,
    updatePagination,
    clearFilters,
    resetToFirstPage,
  };
}
