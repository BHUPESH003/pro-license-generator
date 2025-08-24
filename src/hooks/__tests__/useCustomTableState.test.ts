import { renderHook, act, waitFor } from "@testing-library/react";
import { jest } from "@jest/globals";
import { useCustomTableState } from "../useCustomTableState";
import apiClient from "@/lib/axios";

// Mock Next.js router
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock axios
jest.mock("@/lib/axios", () => ({
  default: {
    get: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe("useCustomTableState", () => {
  const defaultOptions = {
    endpoint: "/api/users",
    defaultPageSize: 25,
    debugMode: false,
  };

  const mockApiResponse = {
    data: {
      success: true,
      data: {
        rows: [
          { id: 1, name: "John Doe", email: "john@example.com" },
          { id: 2, name: "Jane Smith", email: "jane@example.com" },
        ],
        total: 2,
        totalPages: 1,
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockApiClient.get.mockResolvedValue(mockApiResponse);
  });

  describe("Initial State", () => {
    it("initializes with correct default state", () => {
      const { result } = renderHook(() => useCustomTableState(defaultOptions));

      expect(result.current.state).toMatchObject({
        data: [],
        loading: false,
        error: null,
        total: 0,
        page: 1,
        pageSize: 25,
        totalPages: 0,
        sortBy: undefined,
        sortDir: undefined,
        filters: {},
        localFilters: {},
        selectedRows: new Set(),
        globalSearch: "",
      });
    });

    it("initializes with custom default page size", () => {
      const { result } = renderHook(() =>
        useCustomTableState({
          ...defaultOptions,
          defaultPageSize: 50,
        })
      );

      expect(result.current.state.pageSize).toBe(50);
    });

    it("initializes with default sort", () => {
      const { result } = renderHook(() =>
        useCustomTableState({
          ...defaultOptions,
          defaultSort: { field: "name", direction: "desc" },
        })
      );

      expect(result.current.state.sortBy).toBe("name");
      expect(result.current.state.sortDir).toBe("desc");
    });
  });

  describe("Data Fetching", () => {
    it("fetches data on mount", async () => {
      renderHook(() => useCustomTableState(defaultOptions));

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith("/api/users", {
          params: {
            page: "1",
            pageSize: "25",
          },
          signal: expect.any(AbortSignal),
        });
      });
    });

    it("updates state with fetched data", async () => {
      const { result } = renderHook(() => useCustomTableState(defaultOptions));

      await waitFor(() => {
        expect(result.current.state.data).toEqual(
          mockApiResponse.data.data.rows
        );
        expect(result.current.state.total).toBe(2);
        expect(result.current.state.loading).toBe(false);
        expect(result.current.state.error).toBe(null);
      });
    });

    it("handles API errors", async () => {
      const errorMessage = "Network error";
      mockApiClient.get.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useCustomTableState(defaultOptions));

      await waitFor(() => {
        expect(result.current.state.error).toBe(errorMessage);
        expect(result.current.state.loading).toBe(false);
        expect(result.current.state.data).toEqual([]);
      });
    });

    it("sets loading state during fetch", async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockApiClient.get.mockReturnValue(promise);

      const { result } = renderHook(() => useCustomTableState(defaultOptions));

      // Initially loading should be true
      expect(result.current.state.loading).toBe(true);

      // Resolve the promise
      act(() => {
        resolvePromise(mockApiResponse);
      });

      await waitFor(() => {
        expect(result.current.state.loading).toBe(false);
      });
    });
  });

  describe("Filtering", () => {
    it("updates filters and refetches data", async () => {
      const { result } = renderHook(() => useCustomTableState(defaultOptions));

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledTimes(1);
      });

      act(() => {
        result.current.updateFilters({ name: "John" });
      });

      // Should update local filters immediately
      expect(result.current.state.localFilters).toEqual({ name: "John" });

      // Should debounce and then update actual filters
      await waitFor(() => {
        expect(result.current.state.filters).toEqual({ name: "John" });
      });

      // Should make new API call with filters
      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith("/api/users", {
          params: {
            page: "1",
            pageSize: "25",
            filter_name: "John",
          },
          signal: expect.any(AbortSignal),
        });
      });
    });

    it("clears filters", async () => {
      const { result } = renderHook(() => useCustomTableState(defaultOptions));

      // Set some filters first
      act(() => {
        result.current.updateFilters({ name: "John", status: "active" });
      });

      await waitFor(() => {
        expect(result.current.state.localFilters).toEqual({
          name: "John",
          status: "active",
        });
      });

      // Clear filters
      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.state.filters).toEqual({});
      expect(result.current.state.localFilters).toEqual({});
      expect(result.current.state.page).toBe(1);
    });

    it("resets to first page when filters change", async () => {
      const { result } = renderHook(() => useCustomTableState(defaultOptions));

      // Set page to 2
      act(() => {
        result.current.updatePagination(2);
      });

      expect(result.current.state.page).toBe(2);

      // Update filters
      act(() => {
        result.current.updateFilters({ name: "John" });
      });

      // Should reset to page 1
      await waitFor(() => {
        expect(result.current.state.page).toBe(1);
      });
    });
  });

  describe("Sorting", () => {
    it("updates sort and refetches data", async () => {
      const { result } = renderHook(() => useCustomTableState(defaultOptions));

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledTimes(1);
      });

      act(() => {
        result.current.updateSort("name", "asc");
      });

      expect(result.current.state.sortBy).toBe("name");
      expect(result.current.state.sortDir).toBe("asc");

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith("/api/users", {
          params: {
            page: "1",
            pageSize: "25",
            sortBy: "name",
            sortDir: "asc",
          },
          signal: expect.any(AbortSignal),
        });
      });
    });

    it("updates URL when sort changes", () => {
      const { result } = renderHook(() => useCustomTableState(defaultOptions));

      act(() => {
        result.current.updateSort("name", "desc");
      });

      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining("sortBy=name&sortDir=desc"),
        { scroll: false }
      );
    });
  });

  describe("Pagination", () => {
    it("updates page and refetches data", async () => {
      const { result } = renderHook(() => useCustomTableState(defaultOptions));

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledTimes(1);
      });

      act(() => {
        result.current.updatePagination(2);
      });

      expect(result.current.state.page).toBe(2);

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith("/api/users", {
          params: {
            page: "2",
            pageSize: "25",
          },
          signal: expect.any(AbortSignal),
        });
      });
    });

    it("updates page size and resets to first page", async () => {
      const { result } = renderHook(() => useCustomTableState(defaultOptions));

      act(() => {
        result.current.updatePagination(2, 50);
      });

      expect(result.current.state.page).toBe(1); // Should reset to page 1
      expect(result.current.state.pageSize).toBe(50);
    });

    it("updates URL when pagination changes", () => {
      const { result } = renderHook(() => useCustomTableState(defaultOptions));

      act(() => {
        result.current.updatePagination(3);
      });

      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining("page=3"),
        { scroll: false }
      );
    });
  });

  describe("Row Selection", () => {
    it("selects and deselects rows", () => {
      const { result } = renderHook(() => useCustomTableState(defaultOptions));

      // Select row
      act(() => {
        result.current.selectRow("1");
      });

      expect(result.current.state.selectedRows.has("1")).toBe(true);

      // Deselect row
      act(() => {
        result.current.selectRow("1");
      });

      expect(result.current.state.selectedRows.has("1")).toBe(false);
    });

    it("selects all rows", async () => {
      const { result } = renderHook(() => useCustomTableState(defaultOptions));

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.state.data.length).toBe(2);
      });

      act(() => {
        result.current.selectAllRows();
      });

      expect(result.current.state.selectedRows.has("1")).toBe(true);
      expect(result.current.state.selectedRows.has("2")).toBe(true);
    });

    it("deselects all rows when all are selected", async () => {
      const { result } = renderHook(() => useCustomTableState(defaultOptions));

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.state.data.length).toBe(2);
      });

      // Select all rows
      act(() => {
        result.current.selectAllRows();
      });

      expect(result.current.state.selectedRows.size).toBe(2);

      // Select all again should deselect all
      act(() => {
        result.current.selectAllRows();
      });

      expect(result.current.state.selectedRows.size).toBe(0);
    });

    it("clears selection", () => {
      const { result } = renderHook(() => useCustomTableState(defaultOptions));

      // Select some rows
      act(() => {
        result.current.selectRow("1");
        result.current.selectRow("2");
      });

      expect(result.current.state.selectedRows.size).toBe(2);

      // Clear selection
      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.state.selectedRows.size).toBe(0);
    });
  });

  describe("Global Search", () => {
    it("updates global search and refetches data", async () => {
      const { result } = renderHook(() => useCustomTableState(defaultOptions));

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledTimes(1);
      });

      act(() => {
        result.current.updateGlobalSearch("John");
      });

      // Should update local search immediately
      expect(result.current.state.globalSearch).toBe("John");

      // Should make new API call with search
      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith("/api/users", {
          params: {
            page: "1",
            pageSize: "25",
            search: "John",
          },
          signal: expect.any(AbortSignal),
        });
      });
    });

    it("resets to first page when search changes", async () => {
      const { result } = renderHook(() => useCustomTableState(defaultOptions));

      // Set page to 2
      act(() => {
        result.current.updatePagination(2);
      });

      expect(result.current.state.page).toBe(2);

      // Update search
      act(() => {
        result.current.updateGlobalSearch("John");
      });

      // Should reset to page 1
      await waitFor(() => {
        expect(result.current.state.page).toBe(1);
      });
    });
  });

  describe("Export", () => {
    it("exports data to CSV", async () => {
      const csvData = "id,name,email\n1,John Doe,john@example.com";
      mockApiClient.get.mockResolvedValueOnce({ data: csvData });

      // Mock DOM methods
      const mockCreateElement = jest.fn();
      const mockAppendChild = jest.fn();
      const mockRemoveChild = jest.fn();
      const mockCreateObjectURL = jest.fn().mockReturnValue("blob:url");
      const mockRevokeObjectURL = jest.fn();
      const mockClick = jest.fn();

      const mockLink = {
        href: "",
        download: "",
        click: mockClick,
      };

      mockCreateElement.mockReturnValue(mockLink);

      Object.defineProperty(document, "createElement", {
        value: mockCreateElement,
      });
      Object.defineProperty(document.body, "appendChild", {
        value: mockAppendChild,
      });
      Object.defineProperty(document.body, "removeChild", {
        value: mockRemoveChild,
      });
      Object.defineProperty(window.URL, "createObjectURL", {
        value: mockCreateObjectURL,
      });
      Object.defineProperty(window.URL, "revokeObjectURL", {
        value: mockRevokeObjectURL,
      });

      const { result } = renderHook(() => useCustomTableState(defaultOptions));

      await act(async () => {
        const exportedData = await result.current.exportToCsv();
        expect(exportedData).toEqual(result.current.state.data);
      });

      expect(mockApiClient.get).toHaveBeenCalledWith("/api/users", {
        params: {
          export: "csv",
        },
        responseType: "text",
      });

      expect(mockCreateElement).toHaveBeenCalledWith("a");
      expect(mockClick).toHaveBeenCalled();
      expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
      expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
    });
  });

  describe("Refetch", () => {
    it("refetches data and clears cache", async () => {
      const { result } = renderHook(() => useCustomTableState(defaultOptions));

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledTimes(1);
      });

      act(() => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("Caching", () => {
    it("uses cached data for identical requests", async () => {
      const { result } = renderHook(() => useCustomTableState(defaultOptions));

      // Wait for initial fetch
      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledTimes(1);
      });

      // Change page and then change back
      act(() => {
        result.current.updatePagination(2);
      });

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledTimes(2);
      });

      act(() => {
        result.current.updatePagination(1);
      });

      // Should use cache, so no additional API call
      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("Debug Mode", () => {
    it("includes debug info when enabled", async () => {
      const { result } = renderHook(() =>
        useCustomTableState({
          ...defaultOptions,
          debugMode: true,
        })
      );

      await waitFor(() => {
        expect(result.current.state.debugInfo).toBeDefined();
        expect(result.current.state.debugInfo.renderCount).toBeGreaterThan(0);
      });
    });

    it("does not include debug info when disabled", async () => {
      const { result } = renderHook(() => useCustomTableState(defaultOptions));

      await waitFor(() => {
        expect(result.current.state.debugInfo).toBeUndefined();
      });
    });
  });

  describe("Cleanup", () => {
    it("cancels pending requests on unmount", () => {
      const { unmount } = renderHook(() => useCustomTableState(defaultOptions));

      // Mock abort controller
      const mockAbort = jest.fn();
      const mockAbortController = {
        abort: mockAbort,
        signal: {} as AbortSignal,
      };

      // Replace the global AbortController
      const originalAbortController = global.AbortController;
      global.AbortController = jest
        .fn()
        .mockImplementation(() => mockAbortController);

      unmount();

      // Restore original
      global.AbortController = originalAbortController;
    });
  });
});
