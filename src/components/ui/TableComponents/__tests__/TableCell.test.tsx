import React from "react";
import { render, screen } from "@testing-library/react";
import { jest } from "@jest/globals";
import { TableCell } from "../TableCell";
import { DataTableColumn } from "../../CustomDataTable.types";

// Mock AdminTheme
jest.mock("../../../admin/AdminTheme", () => ({
  useAdminTheme: () => ({ isDark: false }),
}));

describe("TableCell", () => {
  const mockRow = {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    status: "active",
    createdAt: "2023-01-01T00:00:00Z",
  };

  describe("Basic Rendering", () => {
    it("renders cell with simple value", () => {
      const column: DataTableColumn = {
        field: "name",
        headerName: "Name",
      };

      render(<TableCell column={column} row={mockRow} value="John Doe" />);

      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("applies column width styles", () => {
      const column: DataTableColumn = {
        field: "name",
        headerName: "Name",
        width: 200,
        minWidth: 100,
        maxWidth: 300,
      };

      const { container } = render(
        <TableCell column={column} row={mockRow} value="John Doe" />
      );

      const cell = container.querySelector("td");
      expect(cell).toHaveStyle({
        width: "200px",
        minWidth: "100px",
        maxWidth: "300px",
      });
    });

    it("applies text alignment", () => {
      const column: DataTableColumn = {
        field: "id",
        headerName: "ID",
        align: "center",
      };

      const { container } = render(
        <TableCell column={column} row={mockRow} value={1} />
      );

      const cell = container.querySelector("td");
      expect(cell).toHaveStyle({ textAlign: "center" });
    });

    it("defaults to left alignment when not specified", () => {
      const column: DataTableColumn = {
        field: "name",
        headerName: "Name",
      };

      const { container } = render(
        <TableCell column={column} row={mockRow} value="John Doe" />
      );

      const cell = container.querySelector("td");
      expect(cell).toHaveStyle({ textAlign: "left" });
    });
  });

  describe("Value Formatting", () => {
    it("applies value formatter when provided", () => {
      const column: DataTableColumn = {
        field: "createdAt",
        headerName: "Created At",
        valueFormatter: (value) => new Date(value).toLocaleDateString(),
      };

      render(
        <TableCell column={column} row={mockRow} value="2023-01-01T00:00:00Z" />
      );

      expect(screen.getByText("1/1/2023")).toBeInTheDocument();
    });

    it("renders raw value when no formatter is provided", () => {
      const column: DataTableColumn = {
        field: "createdAt",
        headerName: "Created At",
      };

      render(
        <TableCell column={column} row={mockRow} value="2023-01-01T00:00:00Z" />
      );

      expect(screen.getByText("2023-01-01T00:00:00Z")).toBeInTheDocument();
    });
  });

  describe("Custom Cell Renderer", () => {
    it("uses custom cell renderer when provided", () => {
      const column: DataTableColumn = {
        field: "status",
        headerName: "Status",
        cellRenderer: (value, row) => (
          <span className={`status-badge status-${value}`}>
            {value.toUpperCase()}
          </span>
        ),
      };

      render(<TableCell column={column} row={mockRow} value="active" />);

      const statusBadge = screen.getByText("ACTIVE");
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge).toHaveClass("status-badge", "status-active");
    });

    it("passes both value and row to cell renderer", () => {
      const mockCellRenderer = jest.fn().mockReturnValue(<span>Rendered</span>);
      const column: DataTableColumn = {
        field: "name",
        headerName: "Name",
        cellRenderer: mockCellRenderer,
      };

      render(<TableCell column={column} row={mockRow} value="John Doe" />);

      expect(mockCellRenderer).toHaveBeenCalledWith("John Doe", mockRow);
    });

    it("prioritizes cell renderer over value formatter", () => {
      const column: DataTableColumn = {
        field: "name",
        headerName: "Name",
        valueFormatter: (value) => value.toUpperCase(),
        cellRenderer: (value) => <span>Custom: {value}</span>,
      };

      render(<TableCell column={column} row={mockRow} value="John Doe" />);

      expect(screen.getByText("Custom: John Doe")).toBeInTheDocument();
      expect(screen.queryByText("JOHN DOE")).not.toBeInTheDocument();
    });
  });

  describe("Cell Classes", () => {
    it("applies static cell class name", () => {
      const column: DataTableColumn = {
        field: "name",
        headerName: "Name",
        cellClassName: "custom-cell-class",
      };

      const { container } = render(
        <TableCell column={column} row={mockRow} value="John Doe" />
      );

      const cell = container.querySelector("td");
      expect(cell).toHaveClass("custom-cell-class");
    });

    it("applies dynamic cell class name from function", () => {
      const column: DataTableColumn = {
        field: "status",
        headerName: "Status",
        cellClassName: (value, row) => `status-${value} user-${row.id}`,
      };

      const { container } = render(
        <TableCell column={column} row={mockRow} value="active" />
      );

      const cell = container.querySelector("td");
      expect(cell).toHaveClass("status-active", "user-1");
    });

    it("combines base classes with custom classes", () => {
      const column: DataTableColumn = {
        field: "name",
        headerName: "Name",
        cellClassName: "custom-class",
      };

      const { container } = render(
        <TableCell column={column} row={mockRow} value="John Doe" />
      );

      const cell = container.querySelector("td");
      expect(cell).toHaveClass("px-4", "py-3", "text-sm", "custom-class");
    });
  });

  describe("Truncation and Tooltips", () => {
    it("adds title attribute for string values", () => {
      const column: DataTableColumn = {
        field: "name",
        headerName: "Name",
      };

      const { container } = render(
        <TableCell column={column} row={mockRow} value="John Doe" />
      );

      const cellContent = container.querySelector("div");
      expect(cellContent).toHaveAttribute("title", "John Doe");
    });

    it("does not add title attribute for non-string values", () => {
      const column: DataTableColumn = {
        field: "status",
        headerName: "Status",
        cellRenderer: (value) => (
          <span className={`status-${value}`}>{value}</span>
        ),
      };

      const { container } = render(
        <TableCell column={column} row={mockRow} value="active" />
      );

      const cellContent = container.querySelector("div");
      expect(cellContent).not.toHaveAttribute("title");
    });

    it("applies truncate class to cell content", () => {
      const column: DataTableColumn = {
        field: "name",
        headerName: "Name",
      };

      const { container } = render(
        <TableCell column={column} row={mockRow} value="John Doe" />
      );

      const cellContent = container.querySelector("div");
      expect(cellContent).toHaveClass("truncate");
    });
  });

  describe("Dark Mode", () => {
    it("applies dark mode text color when isDark is true", () => {
      // Mock dark theme
      jest
        .mocked(require("../../../admin/AdminTheme").useAdminTheme)
        .mockReturnValue({
          isDark: true,
        });

      const column: DataTableColumn = {
        field: "name",
        headerName: "Name",
      };

      const { container } = render(
        <TableCell column={column} row={mockRow} value="John Doe" />
      );

      const cell = container.querySelector("td");
      expect(cell?.className).toContain("admin-foreground");
    });

    it("applies light mode text color when isDark is false", () => {
      const column: DataTableColumn = {
        field: "name",
        headerName: "Name",
      };

      const { container } = render(
        <TableCell column={column} row={mockRow} value="John Doe" />
      );

      const cell = container.querySelector("td");
      expect(cell?.className).toContain("text-[var(--foreground)]");
    });
  });

  describe("Edge Cases", () => {
    it("handles null values", () => {
      const column: DataTableColumn = {
        field: "description",
        headerName: "Description",
      };

      render(<TableCell column={column} row={mockRow} value={null} />);

      expect(screen.getByText("null")).toBeInTheDocument();
    });

    it("handles undefined values", () => {
      const column: DataTableColumn = {
        field: "description",
        headerName: "Description",
      };

      render(<TableCell column={column} row={mockRow} value={undefined} />);

      expect(screen.getByText("undefined")).toBeInTheDocument();
    });

    it("handles empty string values", () => {
      const column: DataTableColumn = {
        field: "description",
        headerName: "Description",
      };

      render(<TableCell column={column} row={mockRow} value="" />);

      // Empty string should render as empty
      const cell = screen.getByRole("cell");
      expect(cell).toHaveTextContent("");
    });

    it("handles numeric values", () => {
      const column: DataTableColumn = {
        field: "id",
        headerName: "ID",
      };

      render(<TableCell column={column} row={mockRow} value={42} />);

      expect(screen.getByText("42")).toBeInTheDocument();
    });

    it("handles boolean values", () => {
      const column: DataTableColumn = {
        field: "isActive",
        headerName: "Active",
      };

      render(<TableCell column={column} row={mockRow} value={true} />);

      expect(screen.getByText("true")).toBeInTheDocument();
    });
  });

  describe("Performance", () => {
    it("memoizes the component to prevent unnecessary re-renders", () => {
      const column: DataTableColumn = {
        field: "name",
        headerName: "Name",
      };

      const { rerender } = render(
        <TableCell column={column} row={mockRow} value="John Doe" />
      );

      // Re-render with same props
      rerender(<TableCell column={column} row={mockRow} value="John Doe" />);

      // Component should be memoized
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });
  });
});
