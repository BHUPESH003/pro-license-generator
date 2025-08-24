import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import { CustomDataTable } from "../CustomDataTable";
import {
  DataTableColumn,
  FilterConfig,
  ActionConfig,
} from "../CustomDataTable.types";
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

// Mock AdminTheme
jest.mock("../../admin/AdminTheme", () => ({
  useAdminTheme: () => ({ isDark: false }),
}));

// Mock axios
jest.mock("@/lib/axios", () => ({
  default: {
    get: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe("CustomDataTable Integration Tests", () => {
  const mockColumns: DataTableColumn[] = [
    {
      field: "id",
      headerName: "ID",
      width: 100,
      sortable: true,
    },
    {
      field: "name",
      headerName: "Name",
      width: 200,
      sortable: true,
    },
    {
      field: "email",
      headerName: "Email",
      width: 250,
      sortable: false,
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      cellRenderer: (value) => (
        <span className={`status-${value} px-2 py-1 rounded`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 150,
      valueFormatter: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  const mockFilters: FilterConfig[] = [
    {
      field: "name",
      type: "text",
      label: "Name",
      placeholder: "Search by name",
      debounceMs: 300,
    },
    {
      field: "status",
      type: "select",
      label: "Status",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "pending", label: "Pending" },
      ],
    },
    {
      field: "createdAt",
      type: "dateRange",
      label: "Created Date",
    },
  ];

  const mockActions: ActionConfig[] = [
    {
      label: "Edit",
      onClick: jest.fn(),
      variant: "outline",
    },
    {
      label: "Delete",
      onClick: jest.fn(),
      variant: "destructive",
      disabled: (row) => row.status === "inactive",
    },
  ];

  const generateMockData = (
    count: number,
    page: number = 1,
    pageSize: number = 25
  ) => {
    const startIndex = (page - 1) * pageSize;
    const data = [];

    for (let i = 0; i < count; i++) {
      const id = startIndex + i + 1;
      data.push({
        id,
        name: `User ${id}`,
        email: `user${id}@example.com`,
        status: ["active", "inactive", "pending"][i % 3],
        createdAt: new Date(2023, 0, id).toISOString(),
      });
    }

    return data;
  };

  const createMockApiResponse = (
    data: any[],
    total: number,
    page: number = 1,
    pageSize: number = 25
  ) => ({
    data: {
      success: true,
      data: {
        rows: data,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    },
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Default API response
    const mockData = generateMockData(25);
    mockApiClient.get.mockResolvedValue(createMockApiResponse(mockData, 100));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("Complete Data Flow", () => {
    it("loads data on mount and displays it correctly", async () => {
      render(<CustomDataTable endpoint="/api/users" columns={mockColumns} />);

      // Should show loading initially
      expect(screen.getByText("Loading...")).toBeInTheDocument();

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText("User 1")).toBeInTheDocument();
      });

      // Check API was called correctly
      expect(mockApiClient.get).toHaveBeenCalledWith("/api/users", {
        params: {
          page: "1",
          pageSize: "25",
        },
        signal: expect.any(AbortSignal),
      });

      // Check data is displayed
      expect(screen.getByText("User 1")).toBeInTheDocument();
      expect(screen.getByText("user1@example.com")).toBeInTheDocument();
      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    it("handles API errors gracefully", async () => {
      const errorMessage = "Network error occurred";
      mockApiClient.get.mockRejectedValue(new Error(errorMessage));

      render(<CustomDataTable endpoint="/api/users" columns={mockColumns} />);

      await waitFor(() => {
        expect(screen.getByText("Failed to load data")).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      // Should show retry button
      const retryButton = screen.getByText("Try Again");
      expect(retryButton).toBeInTheDocument();
    });

    it("retries failed requests when retry button is clicked", async () => {
      // First call fails
      mockApiClient.get.mockRejectedValueOnce(new Error("Network error"));

      // Second call succeeds
      const mockData = generateMockData(25);
      mockApiClient.get.mockResolvedValueOnce(
        createMockApiResponse(mockData, 100)
      );

      render(<CustomDataTable endpoint="/api/users" columns={mockColumns} />);

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByText("Failed to load data")).toBeInTheDocument();
      });

      // Click retry
      const retryButton = screen.getByText("Try Again");
      fireEvent.click(retryButton);

      // Should show loading again
      expect(screen.getByText("Loading...")).toBeInTheDocument();

      // Wait for success
      await waitFor(() => {
        expect(screen.getByText("User 1")).toBeInTheDocument();
      });

      expect(mockApiClient.get).toHaveBeenCalledTimes(2);
    });
  });

  describe("Filtering Integration", () => {
    it("applies text filters with debouncing", async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(
        <CustomDataTable
          endpoint="/api/users"
          columns={mockColumns}
          filters={mockFilters}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText("User 1")).toBeInTheDocument();
      });

      // Type in name filter
      const nameFilter = screen.getByPlaceholderText("Search by name");
      await user.type(nameFilter, "John");

      // Should not call API immediately (debounced)
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);

      // Advance timers to trigger debounce
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Should call API with filter
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

    it("applies select filters immediately", async () => {
      const user = userEvent.setup();

      render(
        <CustomDataTable
          endpoint="/api/users"
          columns={mockColumns}
          filters={mockFilters}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText("User 1")).toBeInTheDocument();
      });

      // Select status filter
      const statusFilter = screen.getByDisplayValue("");
      await user.selectOptions(statusFilter, "active");

      // Should call API immediately (no debounce for select)
      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith("/api/users", {
          params: {
            page: "1",
            pageSize: "25",
            filter_status: "active",
          },
          signal: expect.any(AbortSignal),
        });
      });
    });

    it("combines multiple filters correctly", async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(
        <CustomDataTable
          endpoint="/api/users"
          columns={mockColumns}
          filters={mockFilters}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText("User 1")).toBeInTheDocument();
      });

      // Apply text filter
      const nameFilter = screen.getByPlaceholderText("Search by name");
      await user.type(nameFilter, "John");

      // Apply select filter
      const statusFilter = screen.getByDisplayValue("");
      await user.selectOptions(statusFilter, "active");

      // Advance timers for debounce
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Should call API with both filters
      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith("/api/users", {
          params: {
            page: "1",
            pageSize: "25",
            filter_name: "John",
            filter_status: "active",
          },
          signal: expect.any(AbortSignal),
        });
      });
    });

    it("clears all filters when clear button is clicked", async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(
        <CustomDataTable
          endpoint="/api/users"
          columns={mockColumns}
          filters={mockFilters}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText("User 1")).toBeInTheDocument();
      });

      // Apply filters
      const nameFilter = screen.getByPlaceholderText("Search by name");
      await user.type(nameFilter, "John");

      const statusFilter = screen.getByDisplayValue("");
      await user.selectOptions(statusFilter, "active");

      // Advance timers
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Clear filters
      const clearButton = screen.getByText("Clear Filters");
      await user.click(clearButton);

      // Should call API without filters
      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenLastCalledWith("/api/users", {
          params: {
            page: "1",
            pageSize: "25",
          },
          signal: expect.any(AbortSignal),
        });
      });

      // Filter inputs should be cleared
      expect(nameFilter).toHaveValue("");
      expect(statusFilter).toHaveValue("");
    });

    it("resets to first page when filters change", async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(
        <CustomDataTable
          endpoint="/api/users"
          columns={mockColumns}
          filters={mockFilters}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText("User 1")).toBeInTheDocument();
      });

      // Go to page 2
      const nextButton = screen.getByText("Next");
      await user.click(nextButton);

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith("/api/users", {
          params: {
            page: "2",
            pageSize: "25",
          },
          signal: expect.any(AbortSignal),
        });
      });

      // Apply filter
      const nameFilter = screen.getByPlaceholderText("Search by name");
      await user.type(nameFilter, "John");

      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Should reset to page 1
      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenLastCalledWith("/api/users", {
          params: {
            page: "1",
            pageSize: "25",
            filter_name: "John",
          },
          signal: expect.any(AbortSignal),
        });
      });
    });
  });

  describe("Sorting Integration", () => {
    it("applies sorting when column header is clicked", async () => {
      const user = userEvent.setup();

      render(<CustomDataTable endpoint="/api/users" columns={mockColumns} />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText("User 1")).toBeInTheDocument();
      });

      // Click name column header
      const nameHeader = screen.getByText("Name");
      await user.click(nameHeader);

      // Should call API with sort
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

      // Check sort indicator
      const nameHeaderElement = nameHeader.closest("th");
      expect(nameHeaderElement).toHaveAttribute("aria-sort", "ascending");
    });

    it("toggles sort direction on subsequent clicks", async () => {
      const user = userEvent.setup();

      render(<CustomDataTable endpoint="/api/users" columns={mockColumns} />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText("User 1")).toBeInTheDocument();
      });

      const nameHeader = screen.getByText("Name");

      // First click - ascending
      await user.click(nameHeader);
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

      // Second click - descending
      await user.click(nameHeader);
      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith("/api/users", {
          params: {
            page: "1",
            pageSize: "25",
            sortBy: "name",
            sortDir: "desc",
          },
          signal: expect.any(AbortSignal),
        });
      });

      // Check sort indicator
      const nameHeaderElement = nameHeader.closest("th");
      expect(nameHeaderElement).toHaveAttribute("aria-sort", "descending");
    });

    it("removes sorting on third click", async () => {
      const user = userEvent.setup();

      render(<CustomDataTable endpoint="/api/users" columns={mockColumns} />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText("User 1")).toBeInTheDocument();
      });

      const nameHeader = screen.getByText("Name");

      // Three clicks to remove sorting
      await user.click(nameHeader); // asc
      await user.click(nameHeader); // desc
      await user.click(nameHeader); // remove

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenLastCalledWith("/api/users", {
          params: {
            page: "1",
            pageSize: "25",
          },
          signal: expect.any(AbortSignal),
        });
      });
    });

    it("does not sort non-sortable columns", async () => {
      const user = userEvent.setup();

      render(<CustomDataTable endpoint="/api/users" columns={mockColumns} />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText("User 1")).toBeInTheDocument();
      });

      const initialCallCount = mockApiClient.get.mock.calls.length;

      // Click non-sortable email column
      const emailHeader = screen.getByText("Email");
      await user.click(emailHeader);

      // Should not make additional API call
      expect(mockApiClient.get).toHaveBeenCalledTimes(initialCallCount);
    });
  });

  describe("Pagination Integration", () => {
    it("navigates between pages correctly", async () => {
      const user = userEvent.setup();

      render(<CustomDataTable endpoint="/api/users" columns={mockColumns} />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText("User 1")).toBeInTheDocument();
      });

      // Click next page
      const nextButton = screen.getByText("Next");
      await user.click(nextButton);

      // Should call API for page 2
      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith("/api/users", {
          params: {
            page: "2",
            pageSize: "25",
          },
          signal: expect.any(AbortSignal),
        });
      });

      // Click previous page
      const prevButton = screen.getByText("Previous");
      await user.click(prevButton);

      // Should call API for page 1
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

    it("changes page size and resets to first page", async () => {
      const user = userEvent.setup();

      render(<CustomDataTable endpoint="/api/users" columns={mockColumns} />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText("User 1")).toBeInTheDocument();
      });

      // Go to page 2 first
      const nextButton = screen.getByText("Next");
      await user.click(nextButton);

      // Change page size
      const pageSizeSelect = screen.getByDisplayValue("25");
      await user.selectOptions(pageSizeSelect, "50");

      // Should reset to page 1 with new page size
      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenLastCalledWith("/api/users", {
          params: {
            page: "1",
            pageSize: "50",
          },
          signal: expect.any(AbortSignal),
        });
      });
    });

    it("shows correct pagination info", async () => {
      render(<CustomDataTable endpoint="/api/users" columns={mockColumns} />);

      // Wait for initial load
      await waitFor(() => {
        expect(
          screen.getByText("Showing 1 to 25 of 100 records")
        ).toBeInTheDocument();
        expect(screen.getByText("Page 1 of 4")).toBeInTheDocument();
      });
    });
  });

  describe("URL State Synchronization", () => {
    it("updates URL when filters change", async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(
        <CustomDataTable
          endpoint="/api/users"
          columns={mockColumns}
          filters={mockFilters}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText("User 1")).toBeInTheDocument();
      });

      // Apply filter
      const nameFilter = screen.getByPlaceholderText("Search by name");
      await user.type(nameFilter, "John");

      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Should update URL
      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          expect.stringContaining("filter_name=John"),
          { scroll: false }
        );
      });
    });

    it("updates URL when sorting changes", async () => {
      const user = userEvent.setup();

      render(<CustomDataTable endpoint="/api/users" columns={mockColumns} />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText("User 1")).toBeInTheDocument();
      });

      // Click sort
      const nameHeader = screen.getByText("Name");
      await user.click(nameHeader);

      // Should update URL
      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          expect.stringContaining("sortBy=name&sortDir=asc"),
          { scroll: false }
        );
      });
    });

    it("updates URL when pagination changes", async () => {
      const user = userEvent.setup();

      render(<CustomDataTable endpoint="/api/users" columns={mockColumns} />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText("User 1")).toBeInTheDocument();
      });

      // Change page
      const nextButton = screen.getByText("Next");
      await user.click(nextButton);

      // Should update URL
      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          expect.stringContaining("page=2"),
          { scroll: false }
        );
      });
    });
  });

  describe("Row Selection Integration", () => {
    it("selects and deselects individual rows", async () => {
      const user = userEvent.setup();
      const mockOnRowSelect = jest.fn();

      render(
        <CustomDataTable
          endpoint="/api/users"
          columns={mockColumns}
          selectionEnabled={true}
          onRowSelect={mockOnRowSelect}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText("User 1")).toBeInTheDocument();
      });

      // Select first row
      const firstRowCheckbox = screen.getByLabelText("Select row 1");
      await user.click(firstRowCheckbox);

      // Should call onRowSelect with selected data
      expect(mockOnRowSelect).toHaveBeenCalledWith([
        expect.objectContaining({ id: 1, name: "User 1" }),
      ]);

      // Deselect row
      await user.click(firstRowCheckbox);

      // Should call onRowSelect with empty array
      expect(mockOnRowSelect).toHaveBeenCalledWith([]);
    });

    it("selects all visible rows", async () => {
      const user = userEvent.setup();
      const mockOnRowSelect = jest.fn();

      render(
        <CustomDataTable
          endpoint="/api/users"
          columns={mockColumns}
          selectionEnabled={true}
          onRowSelect={mockOnRowSelect}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText("User 1")).toBeInTheDocument();
      });

      // Select all
      const selectAllCheckbox = screen.getByLabelText(/Select all rows/);
      await user.click(selectAllCheckbox);

      // Should call onRowSelect with all visible data
      expect(mockOnRowSelect).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 1 }),
          expect.objectContaining({ id: 2 }),
          // ... all 25 rows
        ])
      );

      expect(
        mockOnRowSelect.mock.calls[mockOnRowSelect.mock.calls.length - 1][0]
      ).toHaveLength(25);
    });
  });

  describe("Export Integration", () => {
    it("exports data with current filters and sorting", async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const mockOnExport = jest.fn();

      // Mock CSV response
      const csvData = "id,name,email\n1,User 1,user1@example.com";
      mockApiClient.get.mockResolvedValueOnce({ data: csvData });

      // Mock DOM methods for file download
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

      render(
        <CustomDataTable
          endpoint="/api/users"
          columns={mockColumns}
          filters={mockFilters}
          exportEnabled={true}
          onExport={mockOnExport}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText("User 1")).toBeInTheDocument();
      });

      // Apply some filters and sorting
      const nameFilter = screen.getByPlaceholderText("Search by name");
      await user.type(nameFilter, "John");

      const nameHeader = screen.getByText("Name");
      await user.click(nameHeader);

      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Click export
      const exportButton = screen.getByText("Export CSV");
      await user.click(exportButton);

      // Should call API with export parameter and current filters/sorting
      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith("/api/users", {
          params: {
            export: "csv",
            filter_name: "John",
            sortBy: "name",
            sortDir: "asc",
          },
          responseType: "text",
        });
      });

      // Should trigger file download
      expect(mockCreateElement).toHaveBeenCalledWith("a");
      expect(mockClick).toHaveBeenCalled();
      expect(mockOnExport).toHaveBeenCalled();
    });
  });

  describe("Error Recovery", () => {
    it("recovers from network failures", async () => {
      const user = userEvent.setup();

      // First call fails
      mockApiClient.get.mockRejectedValueOnce(new Error("Network error"));

      // Subsequent calls succeed
      const mockData = generateMockData(25);
      mockApiClient.get.mockResolvedValue(createMockApiResponse(mockData, 100));

      render(<CustomDataTable endpoint="/api/users" columns={mockColumns} />);

      // Should show error initially
      await waitFor(() => {
        expect(screen.getByText("Failed to load data")).toBeInTheDocument();
      });

      // Retry should work
      const retryButton = screen.getByText("Try Again");
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText("User 1")).toBeInTheDocument();
      });

      // Further interactions should work normally
      const nextButton = screen.getByText("Next");
      await user.click(nextButton);

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

    it("handles partial failures gracefully", async () => {
      const user = userEvent.setup();

      // Initial load succeeds
      const mockData = generateMockData(25);
      mockApiClient.get.mockResolvedValueOnce(
        createMockApiResponse(mockData, 100)
      );

      // Next page fails
      mockApiClient.get.mockRejectedValueOnce(new Error("Server error"));

      // Retry succeeds
      mockApiClient.get.mockResolvedValueOnce(
        createMockApiResponse(generateMockData(25, 2), 100)
      );

      render(<CustomDataTable endpoint="/api/users" columns={mockColumns} />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText("User 1")).toBeInTheDocument();
      });

      // Try to go to next page (will fail)
      const nextButton = screen.getByText("Next");
      await user.click(nextButton);

      // Should show error but keep existing data
      await waitFor(() => {
        expect(screen.getByText("Failed to load data")).toBeInTheDocument();
      });

      // Retry should work
      const retryButton = screen.getByText("Try Again");
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText("User 26")).toBeInTheDocument();
      });
    });
  });
});
