import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { jest } from "@jest/globals";
import { TableHeader } from "../TableHeader";
import { DataTableColumn } from "../../CustomDataTable.types";

// Mock AdminTheme
jest.mock("../../../admin/AdminTheme", () => ({
  useAdminTheme: () => ({ isDark: false }),
}));

describe("TableHeader", () => {
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
  ];

  const defaultProps = {
    columns: mockColumns,
    onSort: jest.fn(),
    selectedCount: 0,
    totalCount: 10,
    onSelectAll: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders all column headers", () => {
      render(<TableHeader {...defaultProps} />);

      expect(screen.getByText("ID")).toBeInTheDocument();
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
    });

    it("applies custom header class names", () => {
      const columnsWithClassName = [
        {
          ...mockColumns[0],
          headerClassName: "custom-header-class",
        },
        ...mockColumns.slice(1),
      ];

      render(<TableHeader {...defaultProps} columns={columnsWithClassName} />);

      const idHeader = screen.getByText("ID");
      expect(idHeader).toHaveClass("custom-header-class");
    });

    it("applies column width styles", () => {
      render(<TableHeader {...defaultProps} />);

      const idHeader = screen.getByText("ID").closest("th");
      expect(idHeader).toHaveStyle({ width: "100px" });

      const nameHeader = screen.getByText("Name").closest("th");
      expect(nameHeader).toHaveStyle({ width: "200px" });
    });
  });

  describe("Selection", () => {
    it("renders selection checkbox when selectionEnabled is true", () => {
      render(<TableHeader {...defaultProps} selectionEnabled={true} />);

      const checkbox = screen.getByLabelText(/Select all rows/);
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveAttribute("type", "checkbox");
    });

    it("does not render selection checkbox when selectionEnabled is false", () => {
      render(<TableHeader {...defaultProps} selectionEnabled={false} />);

      const checkbox = screen.queryByLabelText(/Select all rows/);
      expect(checkbox).not.toBeInTheDocument();
    });

    it("shows correct selection state - none selected", () => {
      render(
        <TableHeader
          {...defaultProps}
          selectionEnabled={true}
          selectedCount={0}
          totalCount={10}
        />
      );

      const checkbox = screen.getByLabelText(
        /Select all rows/
      ) as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
      expect(checkbox.indeterminate).toBe(false);
    });

    it("shows correct selection state - all selected", () => {
      render(
        <TableHeader
          {...defaultProps}
          selectionEnabled={true}
          selectedCount={10}
          totalCount={10}
        />
      );

      const checkbox = screen.getByLabelText(
        /Select all rows/
      ) as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it("shows correct selection state - some selected (indeterminate)", () => {
      render(
        <TableHeader
          {...defaultProps}
          selectionEnabled={true}
          selectedCount={5}
          totalCount={10}
        />
      );

      const checkbox = screen.getByLabelText(
        /Select all rows/
      ) as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
      expect(checkbox.indeterminate).toBe(true);
    });

    it("calls onSelectAll when selection checkbox is clicked", () => {
      const mockOnSelectAll = jest.fn();
      render(
        <TableHeader
          {...defaultProps}
          selectionEnabled={true}
          onSelectAll={mockOnSelectAll}
        />
      );

      const checkbox = screen.getByLabelText(/Select all rows/);
      fireEvent.click(checkbox);

      expect(mockOnSelectAll).toHaveBeenCalledTimes(1);
    });
  });

  describe("Sorting", () => {
    it("calls onSort when sortable column is clicked", () => {
      const mockOnSort = jest.fn();
      render(<TableHeader {...defaultProps} onSort={mockOnSort} />);

      const nameHeader = screen.getByText("Name");
      fireEvent.click(nameHeader);

      expect(mockOnSort).toHaveBeenCalledWith("name", "asc");
    });

    it("does not call onSort when non-sortable column is clicked", () => {
      const mockOnSort = jest.fn();
      render(<TableHeader {...defaultProps} onSort={mockOnSort} />);

      const emailHeader = screen.getByText("Email");
      fireEvent.click(emailHeader);

      expect(mockOnSort).not.toHaveBeenCalled();
    });

    it("toggles sort direction on subsequent clicks", () => {
      const mockOnSort = jest.fn();
      render(
        <TableHeader
          {...defaultProps}
          onSort={mockOnSort}
          sortBy="name"
          sortDir="asc"
        />
      );

      const nameHeader = screen.getByText("Name");
      fireEvent.click(nameHeader);

      expect(mockOnSort).toHaveBeenCalledWith("name", "desc");
    });

    it("removes sorting on third click", () => {
      const mockOnSort = jest.fn();
      render(
        <TableHeader
          {...defaultProps}
          onSort={mockOnSort}
          sortBy="name"
          sortDir="desc"
        />
      );

      const nameHeader = screen.getByText("Name");
      fireEvent.click(nameHeader);

      expect(mockOnSort).toHaveBeenCalledWith("", "asc");
    });

    it("shows sort icon for currently sorted column", () => {
      render(<TableHeader {...defaultProps} sortBy="name" sortDir="asc" />);

      const nameHeader = screen.getByText("Name").closest("th");
      expect(nameHeader).toHaveAttribute("aria-sort", "ascending");
    });

    it("shows descending sort icon", () => {
      render(<TableHeader {...defaultProps} sortBy="name" sortDir="desc" />);

      const nameHeader = screen.getByText("Name").closest("th");
      expect(nameHeader).toHaveAttribute("aria-sort", "descending");
    });

    it("shows no sort icon for unsorted columns", () => {
      render(<TableHeader {...defaultProps} />);

      const nameHeader = screen.getByText("Name").closest("th");
      expect(nameHeader).toHaveAttribute("aria-sort", "none");
    });

    it("does not show sort icon for non-sortable columns", () => {
      render(<TableHeader {...defaultProps} />);

      const emailHeader = screen.getByText("Email").closest("th");
      expect(emailHeader).not.toHaveAttribute("aria-sort");
    });
  });

  describe("Sticky Header", () => {
    it("applies sticky classes when stickyHeader is true", () => {
      const { container } = render(
        <TableHeader {...defaultProps} stickyHeader={true} />
      );

      const thead = container.querySelector("thead");
      expect(thead).toHaveClass("sticky", "top-0", "z-10");
    });

    it("does not apply sticky classes when stickyHeader is false", () => {
      const { container } = render(
        <TableHeader {...defaultProps} stickyHeader={false} />
      );

      const thead = container.querySelector("thead");
      expect(thead).not.toHaveClass("sticky");
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels for selection checkbox", () => {
      render(
        <TableHeader
          {...defaultProps}
          selectionEnabled={true}
          selectedCount={5}
          totalCount={10}
        />
      );

      const checkbox = screen.getByLabelText(
        "Select all rows (5 of 10 selected)"
      );
      expect(checkbox).toBeInTheDocument();
    });

    it("has proper ARIA sort attributes", () => {
      render(<TableHeader {...defaultProps} sortBy="name" sortDir="asc" />);

      const nameHeader = screen.getByText("Name").closest("th");
      expect(nameHeader).toHaveAttribute("aria-sort", "ascending");

      const idHeader = screen.getByText("ID").closest("th");
      expect(idHeader).toHaveAttribute("aria-sort", "none");

      const emailHeader = screen.getByText("Email").closest("th");
      expect(emailHeader).not.toHaveAttribute("aria-sort");
    });

    it("supports keyboard navigation for sortable columns", () => {
      const mockOnSort = jest.fn();
      render(<TableHeader {...defaultProps} onSort={mockOnSort} />);

      const nameHeader = screen.getByText("Name");

      // Test Enter key
      fireEvent.keyDown(nameHeader, { key: "Enter" });
      expect(mockOnSort).toHaveBeenCalledWith("name", "asc");

      mockOnSort.mockClear();

      // Test Space key
      fireEvent.keyDown(nameHeader, { key: " " });
      expect(mockOnSort).toHaveBeenCalledWith("name", "asc");
    });

    it("does not respond to keyboard events on non-sortable columns", () => {
      const mockOnSort = jest.fn();
      render(<TableHeader {...defaultProps} onSort={mockOnSort} />);

      const emailHeader = screen.getByText("Email");
      fireEvent.keyDown(emailHeader, { key: "Enter" });

      expect(mockOnSort).not.toHaveBeenCalled();
    });
  });

  describe("Dark Mode", () => {
    it("applies dark mode classes when isDark is true", () => {
      // Mock dark theme
      jest
        .mocked(require("../../../admin/AdminTheme").useAdminTheme)
        .mockReturnValue({
          isDark: true,
        });

      const { container } = render(<TableHeader {...defaultProps} />);

      const thead = container.querySelector("thead");
      expect(thead?.className).toContain("admin-background");
    });
  });
});
