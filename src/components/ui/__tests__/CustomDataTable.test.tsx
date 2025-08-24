import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { jest } from "@jest/globals";
import { CustomDataTable } from "../CustomDataTable";
import {
  DataTableColumn,
  FilterConfig,
  ActionConfig,
} from "../CustomDataTable.types";
import * as useCustomTableStateModule from "../../../hooks/useCustomTableState";

// Mock the hook
const mockUseCustomTableState = jest.fn();
jest.mock("../../../hooks/useCustomTableState", () => ({
  useCustomTableState: mockUseCustomTableState,
}));

// Mock AdminTheme
jest.mock("../../admin/AdminTheme", () => ({
  useAdminTheme: () => ({ isDark: false }),
}));

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock axios
jest.mock("@/lib/axios", () => ({
  default: {
    get: jest.fn(),
  },
}));

describe("CustomDataTable", () => {
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
        <span className={`status-${value}`}>{value}</span>
      ),
    },
  ];

  const mockData = [
    { id: 1, name: "John Doe", email: "john@example.com", status: "active" },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      status: "inactive",
    },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", status: "active" },
  ];

  const mockFilters: FilterConfig[] = [
    {
      field: "name",
      type: "text",
      label: "Name",
      placeholder: "Search by name",
    },
    {
      field: "status",
      type: "select",
      label: "Status",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
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

  const defaultMockState = {
    state: {
      data: mockData,
      loading: false,
      error: null,
      total: mockData.length,
      page: 1,
      pageSize: 25,
      totalPages: 1,
      sortBy: undefined,
      sortDir: undefined,
      filters: {},
      localFilters: {},
      selectedRows: new Set(),
      globalSearch: "",
    },
    updateFilters: jest.fn(),
    updateSort: jest.fn(),
    updatePagination: jest.fn(),
    clearFilters: jest.fn(),
    selectRow: jest.fn(),
    selectAllRows: jest.fn(),
    clearSelection: jest.fn(),
    refetch: jest.fn(),
    exportToCsv: jest.fn(),
    updateGlobalSearch: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCustomTableState.mockReturnValue(defaultMockState);
  });

  describe("Basic Rendering", () => {
    it("renders table with columns and data", () => {
      render(<CustomDataTable endpoint="/api/users" columns={mockColumns} />);

      // Check headers
      expect(screen.getByText("ID")).toBeInTheDocument();
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();

      // Check data
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("jane@example.com")).toBeInTheDocument();
      expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
    });

    it("renders custom cell content when cellRenderer is provided", () => {
      render(<CustomDataTable endpoint="/api/users" columns={mockColumns} />);

      // Check custom rendered status cells
      expect(screen.getByText("active")).toBeInTheDocument();
      expect(screen.getByText("inactive")).toBeInTheDocument();
      expect(document.querySelector(".status-active")).toBeInTheDocument();
      expect(document.querySelector(".status-inactive")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(
        <CustomDataTable
          endpoint="/api/users"
          columns={mockColumns}
          className="custom-table-class"
        />
      );

      expect(container.firstChild).toHaveClass("custom-table-class");
    });

    it("applies custom height", () => {
      const { container } = render(
        <CustomDataTable
          endpoint="/api/users"
          columns={mockColumns}
          height="400px"
        />
      );

      const tableContainer = container.querySelector(".relative");
      expect(tableContainer).toHaveStyle({ height: "400px" });
    });
  });

  describe("Loading States", () => {
    it("shows loading overlay when loading", () => {
      mockUseCustomTableState.mockReturnValue({
        ...defaultMockState,
        state: {
          ...defaultMockState.state,
          loading: true,
        },
      });

      render(<CustomDataTable endpoint="/api/users" columns={mockColumns} />);

      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("shows empty state when no data", () => {
      mockUseCustomTableState.mockReturnValue({
        ...defaultMockState,
        state: {
          ...defaultMockState.state,
          data: [],
          total: 0,
        },
      });

      render(<CustomDataTable endpoint="/api/users" columns={mockColumns} />);

      expect(screen.getByText("No data available")).toBeInTheDocument();
    });

    it("shows error state when error occurs", () => {
      const errorMessage = "Failed to load data";
      mockUseCustomTableState.mockReturnValue({
        ...defaultMockState,
        state: {
          ...defaultMockState.state,
          error: errorMessage,
          data: [],
        },
      });

      render(<CustomDataTable endpoint="/api/users" columns={mockColumns} />);

      expect(screen.getByText("Failed to load data")).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe("Sorting", () => {
    it("calls updateSort when sortable column header is clicked", () => {
      const mockUpdateSort = jest.fn();
      mockUseCustomTableState.mockReturnValue({
        ...defaultMockState,
        updateSort: mockUpdateSort,
      });

      render(<CustomDataTable endpoint="/api/users" columns={mockColumns} />);

      fireEvent.click(screen.getByText("Name"));
      expect(mockUpdateSort).toHaveBeenCalledWith("name", "asc");
    });

    it("does not call updateSort for non-sortable columns", () => {
      const mockUpdateSort = jest.fn();
      mockUseCustomTableState.mockReturnValue({
        ...defaultMockState,
        updateSort: mockUpdateSort,
      });

      render(<CustomDataTable endpoint="/api/users" columns={mockColumns} />);

      fireEvent.click(screen.getByText("Email"));
      expect(mockUpdateSort).not.toHaveBeenCalled();
    });

    it("shows sort indicators for sorted columns", () => {
      mockUseCustomTableState.mockReturnValue({
        ...defaultMockState,
        state: {
          ...defaultMockState.state,
          sortBy: "name",
          sortDir: "asc",
        },
      });

      render(<CustomDataTable endpoint="/api/users" columns={mockColumns} />);

      // Check for sort indicator (this would depend on your actual implementation)
      const nameHeader = screen.getByText("Name").closest("th");
      expect(nameHeader).toHaveAttribute("aria-sort", "ascending");
    });
  });

  describe("Filtering", () => {
    it("renders filters when provided", () => {
      render(
        <CustomDataTable
          endpoint="/api/users"
          columns={mockColumns}
          filters={mockFilters}
        />
      );

      expect(screen.getByLabelText("Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Status")).toBeInTheDocument();
    });

    it("calls updateFilters when filter values change", async () => {
      const mockUpdateFilters = jest.fn();
      mockUseCustomTableState.mockReturnValue({
        ...defaultMockState,
        updateFilters: mockUpdateFilters,
      });

      render(
        <CustomDataTable
          endpoint="/api/users"
          columns={mockColumns}
          filters={mockFilters}
        />
      );

      const nameFilter = screen.getByPlaceholderText("Search by name");
      fireEvent.change(nameFilter, { target: { value: "John" } });

      await waitFor(() => {
        expect(mockUpdateFilters).toHaveBeenCalledWith({ name: "John" });
      });
    });

    it("calls clearFilters when clear button is clicked", () => {
      const mockClearFilters = jest.fn();
      mockUseCustomTableState.mockReturnValue({
        ...defaultMockState,
        clearFilters: mockClearFilters,
      });

      render(
        <CustomDataTable
          endpoint="/api/users"
          columns={mockColumns}
          filters={mockFilters}
        />
      );

      const clearButton = screen.getByText("Clear Filters");
      fireEvent.click(clearButton);

      expect(mockClearFilters).toHaveBeenCalled();
    });
  });

  describe("Row Selection", () => {
    it("renders selection checkboxes when selectionEnabled is true", () => {
      render(
        <CustomDataTable
          endpoint="/api/users"
          columns={mockColumns}
          selectionEnabled={true}
        />
      );

      // Check for header checkbox
      const headerCheckbox = screen.getByLabelText(/Select all rows/);
      expect(headerCheckbox).toBeInTheDocument();

      // Check for row checkboxes
      const rowCheckboxes = screen.getAllByLabelText(/Select row/);
      expect(rowCheckboxes).toHaveLength(mockData.length);
    });

    it("calls selectRow when individual row checkbox is clicked", () => {
      const mockSelectRow = jest.fn();
      mockUseCustomTableState.mockReturnValue({
        ...defaultMockState,
        selectRow: mockSelectRow,
      });

      render(
        <CustomDataTable
          endpoint="/api/users"
          columns={mockColumns}
          selectionEnabled={true}
        />
      );

      const firstRowCheckbox = screen.getByLabelText("Select row 1");
      fireEvent.click(firstRowCheckbox);

      expect(mockSelectRow).toHaveBeenCalledWith("1");
    });

    it("calls selectAllRows when header checkbox is clicked", () => {
      const mockSelectAllRows = jest.fn();
      mockUseCustomTableState.mockReturnValue({
        ...defaultMockState,
        selectAllRows: mockSelectAllRows,
      });

      render(
        <CustomDataTable
          endpoint="/api/users"
          columns={mockColumns}
          selectionEnabled={true}
        />
      );

      const headerCheckbox = screen.getByLabelText(/Select all rows/);
      fireEvent.click(headerCheckbox);

      expect(mockSelectAllRows).toHaveBeenCalled();
    });

    it("calls onRowSelect callback when selection changes", () => {
      const mockOnRowSelect = jest.fn();
      mockUseCustomTableState.mockReturnValue({
        ...defaultMockState,
        state: {
          ...defaultMockState.state,
          selectedRows: new Set(["1"]),
        },
      });

      render(
        <CustomDataTable
          endpoint="/api/users"
          columns={mockColumns}
          selectionEnabled={true}
          onRowSelect={mockOnRowSelect}
        />
      );

      expect(mockOnRowSelect).toHaveBeenCalledWith([mockData[0]]);
    });
  });

  describe("Row Actions", () => {
    it("renders action buttons for each row", () => {
      render(
        <CustomDataTable
          endpoint="/api/users"
          columns={mockColumns}
          actions={mockActions}
        />
      );

      // Check for Edit buttons
      const editButtons = screen.getAllByText("Edit");
      expect(editButtons).toHaveLength(mockData.length);

      // Check for Delete buttons
      const deleteButtons = screen.getAllByText("Delete");
      expect(deleteButtons).toHaveLength(mockData.length);
    });

    it("calls action onClick when button is clicked", () => {
      const mockEditAction = jest.fn();
      const actionsWithMock = [
        {
          ...mockActions[0],
          onClick: mockEditAction,
        },
        mockActions[1],
      ];

      render(
        <CustomDataTable
          endpoint="/api/users"
          columns={mockColumns}
          actions={actionsWithMock}
        />
      );

      const firstEditButton = screen.getAllByText("Edit")[0];
      fireEvent.click(firstEditButton);

      expect(mockEditAction).toHaveBeenCalledWith(mockData[0]);
    });

    it("disables action buttons based on disabled condition", () => {
      render(
        <CustomDataTable
          endpoint="/api/users"
          columns={mockColumns}
          actions={mockActions}
        />
      );

      const deleteButtons = screen.getAllByText("Delete");

      // Second row has status 'inactive', so delete button should be disabled
      expect(deleteButtons[1]).toBeDisabled();

      // First and third rows have status 'active', so delete buttons should be enabled
      expect(deleteButtons[0]).not.toBeDisabled();
      expect(deleteButtons[2]).not.toBeDisabled();
    });
  });

  describe("Row Click", () => {
    it("calls onRowClick when row is clicked", () => {
      const mockOnRowClick = jest.fn();

      render(
        <CustomDataTable
          endpoint="/api/users"
          columns={mockColumns}
          onRowClick={mockOnRowClick}
        />
      );

      const firstRow = screen.getByText("John Doe").closest("tr");
      fireEvent.click(firstRow!);

      expect(mockOnRowClick).toHaveBeenCalledWith(mockData[0]);
    });

    it("does not call onRowClick when clicking on action buttons", () => {
      const mockOnRowClick = jest.fn();

      render(
        <CustomDataTable
          endpoint="/api/users"
          columns={mockColumns}
          actions={mockActions}
          onRowClick={mockOnRowClick}
        />
      );

      const editButton = screen.getAllByText("Edit")[0];
      fireEvent.click(editButton);

      expect(mockOnRowClick).not.toHaveBeenCalled();
    });
  });

  describe("Global Search", () => {
    it("renders global search when searchEnabled is true", () => {
      render(
        <CustomDataTable
          endpoint="/api/users"
          columns={mockColumns}
          searchEnabled={true}
        />
      );

      expect(
        screen.getByPlaceholderText("Search across all columns...")
      ).toBeInTheDocument();
    });

    it("calls updateGlobalSearch when search input changes", async () => {
      const mockUpdateGlobalSearch = jest.fn();
      mockUseCustomTableState.mockReturnValue({
        ...defaultMockState,
        updateGlobalSearch: mockUpdateGlobalSearch,
      });

      render(
        <CustomDataTable
          endpoint="/api/users"
          columns={mockColumns}
          searchEnabled={true}
        />
      );

      const searchInput = screen.getByPlaceholderText(
        "Search across all columns..."
      );
      fireEvent.change(searchInput, { target: { value: "John" } });

      expect(mockUpdateGlobalSearch).toHaveBeenCalledWith("John");
    });
  });

  describe("Export", () => {
    it("renders export button when exportEnabled is true", () => {
      render(
        <CustomDataTable
          endpoint="/api/users"
          columns={mockColumns}
          filters={mockFilters}
          exportEnabled={true}
        />
      );

      expect(screen.getByText("Export CSV")).toBeInTheDocument();
    });

    it("calls exportToCsv when export button is clicked", async () => {
      const mockExportToCsv = jest.fn().mockResolvedValue(mockData);
      mockUseCustomTableState.mockReturnValue({
        ...defaultMockState,
        exportToCsv: mockExportToCsv,
      });

      render(
        <CustomDataTable
          endpoint="/api/users"
          columns={mockColumns}
          filters={mockFilters}
          exportEnabled={true}
        />
      );

      const exportButton = screen.getByText("Export CSV");
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(mockExportToCsv).toHaveBeenCalled();
      });
    });

    it("calls onExport callback when export completes", async () => {
      const mockOnExport = jest.fn();
      const mockExportToCsv = jest.fn().mockResolvedValue(mockData);
      mockUseCustomTableState.mockReturnValue({
        ...defaultMockState,
        exportToCsv: mockExportToCsv,
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

      const exportButton = screen.getByText("Export CSV");
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(mockOnExport).toHaveBeenCalledWith(mockData);
      });
    });
  });

  describe("Pagination", () => {
    it("renders pagination controls", () => {
      mockUseCustomTableState.mockReturnValue({
        ...defaultMockState,
        state: {
          ...defaultMockState.state,
          total: 100,
          totalPages: 4,
        },
      });

      render(<CustomDataTable endpoint="/api/users" columns={mockColumns} />);

      expect(screen.getByText("Previous")).toBeInTheDocument();
      expect(screen.getByText("Next")).toBeInTheDocument();
      expect(screen.getByText("Page")).toBeInTheDocument();
      expect(screen.getByText("of 4")).toBeInTheDocument();
    });

    it("calls updatePagination when page changes", () => {
      const mockUpdatePagination = jest.fn();
      mockUseCustomTableState.mockReturnValue({
        ...defaultMockState,
        updatePagination: mockUpdatePagination,
        state: {
          ...defaultMockState.state,
          total: 100,
          totalPages: 4,
        },
      });

      render(<CustomDataTable endpoint="/api/users" columns={mockColumns} />);

      const nextButton = screen.getByText("Next");
      fireEvent.click(nextButton);

      expect(mockUpdatePagination).toHaveBeenCalledWith(2);
    });
  });

  describe("Debug Mode", () => {
    it("shows debug info when debugMode is true", () => {
      mockUseCustomTableState.mockReturnValue({
        ...defaultMockState,
        state: {
          ...defaultMockState.state,
          debugInfo: {
            apiCalls: [],
            renderCount: 1,
            cacheHits: 0,
            cacheMisses: 0,
            errorCount: 0,
          },
        },
      });

      render(
        <CustomDataTable
          endpoint="/api/users"
          columns={mockColumns}
          debugMode={true}
        />
      );

      expect(screen.getByText(/"renderCount": 1/)).toBeInTheDocument();
    });
  });
});
