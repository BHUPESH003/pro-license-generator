"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CustomTableState,
  UseCustomTableStateOptions,
  TableCache,
} from "../components/ui/CustomDataTable.types";
import apiClient from "@/lib/axios";
// Removed unused imports for cache manager and request optimization to satisfy lint rules

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;

  const debounced = ((...args: any[]) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T & { cancel: () => void };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}

// Utility functions for URL state management
function parseTableStateFromUrl(
  searchParams: URLSearchParams,
  defaultPageSize: number,
  defaultSort?: { field: string; direction: "asc" | "desc" }
) {
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(
    searchParams.get("pageSize") || defaultPageSize.toString()
  );
  const sortBy = searchParams.get("sortBy") || defaultSort?.field;
  const sortDir =
    (searchParams.get("sortDir") as "asc" | "desc") || defaultSort?.direction;
  const globalSearch = searchParams.get("search") || "";

  // Parse filters
  const filters: Record<string, any> = {};
  for (const [key, value] of searchParams.entries()) {
    if (key.startsWith("filter_")) {
      const filterKey = key.replace("filter_", "");
      filters[filterKey] = value;
    }
  }

  return {
    page,
    pageSize,
    sortBy,
    sortDir,
    filters,
    globalSearch,
  };
}

function tableStateToUrlParams(
  state: Partial<CustomTableState>,
  currentParams: URLSearchParams,
  defaultPageSize: number
) {
  const params = new URLSearchParams(currentParams);

  // Update pagination
  if (state.page !== undefined) {
    if (state.page === 1) {
      params.delete("page");
    } else {
      params.set("page", state.page.toString());
    }
  }

  if (state.pageSize !== undefined) {
    if (state.pageSize === defaultPageSize) {
      params.delete("pageSize");
    } else {
      params.set("pageSize", state.pageSize.toString());
    }
  }

  // Update sorting
  if (state.sortBy !== undefined) {
    if (state.sortBy) {
      params.set("sortBy", state.sortBy);
    } else {
      params.delete("sortBy");
    }
  }

  if (state.sortDir !== undefined) {
    if (state.sortDir) {
      params.set("sortDir", state.sortDir);
    } else {
      params.delete("sortDir");
    }
  }

  // Update filters
  if (state.filters !== undefined) {
    // Remove existing filter params
    for (const key of Array.from(params.keys())) {
      if (key.startsWith("filter_")) {
        params.delete(key);
      }
    }

    // Add new filter params
    Object.entries(state.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(`filter_${key}`, value.toString());
      }
    });
  }

  // Update global search
  if (state.globalSearch !== undefined) {
    if (state.globalSearch) {
      params.set("search", state.globalSearch);
    } else {
      params.delete("search");
    }
  }

  return params;
}

export function useCustomTableState(options: UseCustomTableStateOptions) {
  const {
    endpoint,
    defaultPageSize = 25,
    defaultSort,
    cacheTimeout = 5 * 60 * 1000,
    debugMode = false,
  } = options;

  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize cache and request optimization
  // Local cache store and abort controller for in-flight requests
  const cacheRef = useRef<Map<string, TableCache<any>>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize state from URL
  const [state, setState] = useState<CustomTableState>(() => {
    const urlState = parseTableStateFromUrl(
      searchParams,
      defaultPageSize,
      defaultSort
    );
    return {
      data: [],
      loading: false,
      error: null,
      total: 0,
      page: urlState.page,
      pageSize: urlState.pageSize,
      totalPages: 0,
      sortBy: urlState.sortBy,
      sortDir: urlState.sortDir,
      filters: urlState.filters,
      localFilters: urlState.filters,
      selectedRows: new Set(),
      globalSearch: urlState.globalSearch,
    };
  });
  console.log("searchParams", state.data);

  const lastApiCallRef = useRef<string>("");

  // Debug info
  const debugInfoRef = useRef({
    apiCalls: [] as Array<{ timestamp: number; url: string; params: any }>,
    renderCount: 0,
    cacheHits: 0,
    cacheMisses: 0,
    errorCount: 0,
  });

  // Update URL when state changes
  const updateUrl = useCallback(
    (newState: Partial<CustomTableState>, replace: boolean = true) => {
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

  // Generate cache key
  const generateCacheKey = useCallback(
    (
      endpoint: string,
      page: number,
      pageSize: number,
      sortBy?: string,
      sortDir?: string,
      filters: Record<string, any> = {},
      globalSearch: string = ""
    ) => {
      return JSON.stringify({
        endpoint,
        page,
        pageSize,
        sortBy,
        sortDir,
        filters,
        globalSearch,
      });
    },
    []
  );

  // Check cache
  const getCachedData = useCallback(
    (key: string) => {
      const cached = cacheRef.current.get(key);
      if (cached && Date.now() - cached.timestamp < cacheTimeout) {
        if (debugMode) {
          debugInfoRef.current.cacheHits++;
          console.log("Cache hit:", key);
        }
        return cached;
      }
      if (debugMode && cached) {
        debugInfoRef.current.cacheMisses++;
        console.log("Cache miss (expired):", key);
      }
      return null;
    },
    [cacheTimeout, debugMode]
  );

  // Set cache with intelligent cleanup
  const setCachedData = useCallback(
    (
      key: string,
      data: any[],
      total: number,
      filters: Record<string, any>,
      sort: { field?: string; direction?: "asc" | "desc" }
    ) => {
      cacheRef.current.set(key, {
        key,
        data,
        total,
        timestamp: Date.now(),
        filters,
        sort,
      });

      // Clean old cache entries and limit cache size
      const now = Date.now();
      const maxCacheSize = 50; // Limit cache to 50 entries

      // Remove expired entries
      for (const [cacheKey, cache] of cacheRef.current.entries()) {
        if (now - cache.timestamp > cacheTimeout) {
          cacheRef.current.delete(cacheKey);
        }
      }

      // If still too many entries, remove oldest ones
      if (cacheRef.current.size > maxCacheSize) {
        const entries = Array.from(cacheRef.current.entries());
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

        const entriesToRemove = entries.slice(0, entries.length - maxCacheSize);
        entriesToRemove.forEach(([key]) => {
          cacheRef.current.delete(key);
        });
      }
    },
    [cacheTimeout]
  );

  // Fetch data from API
  const fetchData = useCallback(async () => {
    const cacheKey = generateCacheKey(
      endpoint,
      state.page,
      state.pageSize,
      state.sortBy,
      state.sortDir,
      state.filters,
      state.globalSearch
    );

    // If an identical request is already the last one we fired, do nothing
    if (lastApiCallRef.current === cacheKey) {
      if (debugMode) {
        console.log("Skipping duplicate API call:", cacheKey);
      }
      return;
    }

    // Serve from cache without cancelling any in-flight request
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      setState((prev) => ({
        ...prev,
        data: cachedData.data,
        total: cachedData.total,
        totalPages: Math.ceil(cachedData.total / state.pageSize),
        loading: false,
        error: null,
      }));
      return;
    }

    // Only now cancel previous request (we are about to issue a different request)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    lastApiCallRef.current = cacheKey;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const queryParams = new URLSearchParams();

      // Pagination
      queryParams.set("page", state.page.toString());
      queryParams.set("pageSize", state.pageSize.toString());

      // Sorting
      if (state.sortBy && state.sortDir) {
        queryParams.set("sortBy", state.sortBy);
        queryParams.set("sortDir", state.sortDir);
      }

      // Filters
      Object.entries(state.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.set(`filter_${key}`, value.toString());
        }
      });

      // Global search
      if (state.globalSearch) {
        queryParams.set("search", state.globalSearch);
      }

      if (debugMode) {
        debugInfoRef.current.apiCalls.push({
          timestamp: Date.now(),
          url: endpoint,
          params: Object.fromEntries(queryParams.entries()),
        });
        console.log(
          "API call:",
          endpoint,
          Object.fromEntries(queryParams.entries())
        );
      }

      const { data } = await apiClient.get(endpoint, {
        params: Object.fromEntries(queryParams.entries()),
        // Do not pass signal when debugMode is true, to help diagnose cancels
        ...(debugMode ? {} : { signal: abortController.signal }),
      });

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch data");
      }

      // Cache the response
      setCachedData(cacheKey, data.data.rows, data.data.total, state.filters, {
        field: state.sortBy,
        direction: state.sortDir,
      });

      setState((prev) => ({
        ...prev,
        data: data.data.rows,
        total: data.data.total,
        totalPages:
          data.data.totalPages || Math.ceil(data.data.total / state.pageSize),
        loading: false,
        error: null,
      }));
    } catch (error: any) {
      if (error.name === "AbortError") {
        // Swallow aborts silently; keep last known data and state
        if (debugMode) {
          console.warn("Request aborted (likely superseded by a newer request)");
        }
        return;
      }

      if (debugMode) {
        debugInfoRef.current.errorCount++;
        console.error("API error:", error);
      }

      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || "Failed to fetch data",
        data: [],
        total: 0,
        totalPages: 0,
      }));
    }
  }, [
    endpoint,
    state.page,
    state.pageSize,
    state.sortBy,
    state.sortDir,
    state.filters,
    state.globalSearch,
    generateCacheKey,
    getCachedData,
    setCachedData,
    debugMode,
  ]);

  // Debounced filter update for text inputs
  const debouncedFilterUpdate = useMemo(
    () =>
      debounce((filters: Record<string, any>) => {
        setState((prev) => ({
          ...prev,
          filters,
          page: 1, // Reset to first page when filtering
        }));
        updateUrl({ filters, page: 1 });
      }, 300),
    [updateUrl]
  );

  // Debounced global search update
  const debouncedSearchUpdate = useMemo(
    () =>
      debounce((search: string) => {
        setState((prev) => ({
          ...prev,
          globalSearch: search,
          page: 1, // Reset to first page when searching
        }));
        updateUrl({ globalSearch: search, page: 1 });
      }, 300),
    [updateUrl]
  );

  // Update filters
  const updateFilters = useCallback(
    (filters: Record<string, any>) => {
      // Update local filters immediately for UI
      setState((prev) => ({ ...prev, localFilters: filters }));

      // Debounce the actual filter update
      debouncedFilterUpdate(filters);
    },
    [debouncedFilterUpdate]
  );

  // Update sorting
  const updateSort = useCallback(
    (field: string, direction: "asc" | "desc") => {
      setState((prev) => ({
        ...prev,
        sortBy: field,
        sortDir: direction,
      }));
      updateUrl({ sortBy: field, sortDir: direction });
    },
    [updateUrl]
  );

  // Update pagination
  const updatePagination = useCallback(
    (page: number, pageSize?: number) => {
      const updates: Partial<CustomTableState> = { page };
      if (pageSize !== undefined) {
        updates.pageSize = pageSize;
      }

      setState((prev) => ({ ...prev, ...updates }));
      updateUrl(updates);
    },
    [updateUrl]
  );

  // Clear filters
  const clearFilters = useCallback(() => {
    debouncedFilterUpdate.cancel();
    setState((prev) => ({
      ...prev,
      filters: {},
      localFilters: {},
      page: 1,
    }));
    updateUrl({ filters: {}, page: 1 });
  }, [debouncedFilterUpdate, updateUrl]);

  // Row selection functions
  const selectRow = useCallback((id: string) => {
    setState((prev) => {
      const newSelectedRows = new Set(prev.selectedRows);
      if (newSelectedRows.has(id)) {
        newSelectedRows.delete(id);
      } else {
        newSelectedRows.add(id);
      }
      return { ...prev, selectedRows: newSelectedRows };
    });
  }, []);

  const selectAllRows = useCallback(() => {
    setState((prev) => {
      const allIds = prev.data.map((row) => row.id || row._id).filter(Boolean);
      const newSelectedRows = new Set(prev.selectedRows);

      // If all current page rows are selected, deselect them
      const allCurrentSelected = allIds.every((id) => newSelectedRows.has(id));

      if (allCurrentSelected) {
        allIds.forEach((id) => newSelectedRows.delete(id));
      } else {
        allIds.forEach((id) => newSelectedRows.add(id));
      }

      return { ...prev, selectedRows: newSelectedRows };
    });
  }, []);

  const clearSelection = useCallback(() => {
    setState((prev) => ({ ...prev, selectedRows: new Set() }));
  }, []);

  // Global search
  const updateGlobalSearch = useCallback(
    (search: string) => {
      // Update local search immediately for UI
      setState((prev) => ({ ...prev, globalSearch: search }));

      // Debounce the actual search update
      debouncedSearchUpdate(search);
    },
    [debouncedSearchUpdate]
  );

  // Export to CSV
  const exportToCsv = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.set("export", "csv");

      // Include current filters and sorting
      Object.entries(state.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.set(`filter_${key}`, value.toString());
        }
      });

      if (state.sortBy && state.sortDir) {
        queryParams.set("sortBy", state.sortBy);
        queryParams.set("sortDir", state.sortDir);
      }

      if (state.globalSearch) {
        queryParams.set("search", state.globalSearch);
      }

      const { data } = await apiClient.get(endpoint, {
        params: Object.fromEntries(queryParams.entries()),
        responseType: "text",
      });

      // Create and download CSV file
      const blob = new Blob([data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return state.data;
    } catch (error) {
      console.error("Export failed:", error);
      throw error;
    }
  }, [
    endpoint,
    state.filters,
    state.sortBy,
    state.sortDir,
    state.globalSearch,
    state.data,
  ]);

  // Refetch data
  const refetch = useCallback(() => {
    // Clear cache for current query
    const cacheKey = generateCacheKey(
      endpoint,
      state.page,
      state.pageSize,
      state.sortBy,
      state.sortDir,
      state.filters,
      state.globalSearch
    );
    cacheRef.current.delete(cacheKey);
    lastApiCallRef.current = "";
    fetchData();
  }, [
    fetchData,
    generateCacheKey,
    endpoint,
    state.page,
    state.pageSize,
    state.sortBy,
    state.sortDir,
    state.filters,
    state.globalSearch,
  ]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Sync state with URL changes (for browser back/forward)
  useEffect(() => {
    const urlState = parseTableStateFromUrl(
      searchParams,
      defaultPageSize,
      defaultSort
    );
    setState((prev) => ({
      ...prev,
      page: urlState.page,
      pageSize: urlState.pageSize,
      sortBy: urlState.sortBy,
      sortDir: urlState.sortDir,
      filters: urlState.filters,
      localFilters: urlState.filters,
      globalSearch: urlState.globalSearch,
    }));
  }, [searchParams, defaultPageSize, defaultSort]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      debouncedFilterUpdate.cancel();
      debouncedSearchUpdate.cancel();

      // Clear cache to prevent memory leaks
      cacheRef.current.clear();

      // Reset refs
      lastApiCallRef.current = "";
      debugInfoRef.current = {
        apiCalls: [],
        renderCount: 0,
        cacheHits: 0,
        cacheMisses: 0,
        errorCount: 0,
      };
    };
  }, [debouncedFilterUpdate, debouncedSearchUpdate]);

  // Debug info
  if (debugMode) {
    debugInfoRef.current.renderCount++;
  }

  return {
    state: debugMode ? { ...state, debugInfo: debugInfoRef.current } : state,
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
  };
}
