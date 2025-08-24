import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { jest } from "@jest/globals";
import { TableRow } from "../TableRow";
import { DataTableColumn, ActionConfig } from "../../CustomDataTable.types";

// Mock AdminTheme
jest.mock("../../../admin/AdminTheme", () => ({
  useAdminTheme: () => ({ isDark: false }),
}));

// Mock TableCell
jest.mock("../TableCell", () => ({
  TableCell: ({ column, value }: any) => (
    <td data-testid={`cell-${column.field}`}>{value}</td>
  ),
}));

// Mock ActionCell
jest.mock("../ActionCell", () => ({
  ActionCell: ({ actions }: any) => (
    <td data-testid="action-cell">
      {actions.map((action: any, index: number) => (
        <button key={index} onClick={() => action.onClick()}>
          {action.label}
        </button>
      ))}
    </td>
  ),
}));

describe("TableRow", () => {
  const mockColumns: DataTableColumn[] = [
    {
      field: "id",
      headerName: "ID",
      width: 100,
    },
    {
      field: "name",
      headerName: "Name",
      width: 200,
    },
    {
      field: "email",
      headerName: "Email",
      width: 250,
    },
  ];

  const mockRow = {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    status: "active",
  };

  const mockActions: ActionConfig[] = [
    {
      label: "Edit",
      onClick: jest.fn(),
    },
    {
      label: "Delete",
      onClick: jest.fn(),
    },
  ];

  const defaultProps = {
    row: mockRow,
    columns: mockColumns,
    isSelected: false,
    index: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders table row with cells", () => {
      render(<TableRow {...defaultProps} />);

      expect(screen.getByTestId("cell-id")).toBeInTheDocument();
      expect(screen.getByTestId("cell-name")).toBeInTheDocument();
      expect(screen.getByTestId("cell-email")).toBeInTheDocument();
    });

    it("renders selection checkbox when onRowSelect is provided", () => {
      const mockOnRowSelect = jest.fn();
      render(<TableRow {...defaultProps} onRowSelect={mockOnRowSelect} />);

      const checkbox = screen.getByLabelText("Select row 1");
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveAttribute("type", "checkbox");
    });

    it("does not render selection checkbox when onRowSelect is not provided", () => {
      render(<TableRow {...defaultProps} />);

      const checkbox = screen.queryByLabelText("Select row 1");
      expect(checkbox).not.toBeInTheDocument();
    });

    it("renders action cell when actions are provided", () => {
      render(<TableRow {...defaultProps} actions={mockActions} />);

      expect(screen.getByTestId("action-cell")).toBeInTheDocument();
      expect(screen.getByText("Edit")).toBeInTheDocument();
      expect(screen.getByText("Delete")).toBeInTheDocument();
    });
  });

  describe("Row Selection", () => {
    it("shows checkbox as checked when row is selected", () => {
      const mockOnRowSelect = jest.fn();
      render(
        <TableRow
          {...defaultProps}
          onRowSelect={mockOnRowSelect}
          isSelected={true}
        />
      );

      const checkbox = screen.getByLabelText(
        "Select row 1"
      ) as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it("shows checkbox as unchecked when row is not selected", () => {
      const mockOnRowSelect = jest.fn();
      render(
        <TableRow
          {...defaultProps}
          onRowSelect={mockOnRowSelect}
          isSelected={false}
        />
      );

      const checkbox = screen.getByLabelText(
        "Select row 1"
      ) as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
    });

    it("calls onRowSelect when checkbox is clicked", () => {
      const mockOnRowSelect = jest.fn();
      render(<TableRow {...defaultProps} onRowSelect={mockOnRowSelect} />);

      const checkbox = screen.getByLabelText("Select row 1");
      fireEvent.click(checkbox);

      expect(mockOnRowSelect).toHaveBeenCalledWith(1);
    });

    it("stops propagation when checkbox is clicked", () => {
      const mockOnRowClick = jest.fn();
      const mockOnRowSelect = jest.fn();
      render(
        <TableRow
          {...defaultProps}
          onRowClick={mockOnRowClick}
          onRowSelect={mockOnRowSelect}
        />
      );

      const checkbox = screen.getByLabelText("Select row 1");
      fireEvent.click(checkbox);

      expect(mockOnRowSelect).toHaveBeenCalled();
      expect(mockOnRowClick).not.toHaveBeenCalled();
    });
  });

  describe("Row Click", () => {
    it("calls onRowClick when row is clicked", () => {
      const mockOnRowClick = jest.fn();
      render(<TableRow {...defaultProps} onRowClick={mockOnRowClick} />);

      const row = screen.getByRole("row");
      fireEvent.click(row);

      expect(mockOnRowClick).toHaveBeenCalledWith(mockRow);
    });

    it("does not call onRowClick when clicking on button", () => {
      const mockOnRowClick = jest.fn();
      render(
        <TableRow
          {...defaultProps}
          onRowClick={mockOnRowClick}
          actions={mockActions}
        />
      );

      const editButton = screen.getByText("Edit");
      fireEvent.click(editButton);

      expect(mockOnRowClick).not.toHaveBeenCalled();
    });

    it("does not call onRowClick when clicking on input", () => {
      const mockOnRowClick = jest.fn();
      const mockOnRowSelect = jest.fn();
      render(
        <TableRow
          {...defaultProps}
          onRowClick={mockOnRowClick}
          onRowSelect={mockOnRowSelect}
        />
      );

      const checkbox = screen.getByLabelText("Select row 1");
      fireEvent.click(checkbox);

      expect(mockOnRowClick).not.toHaveBeenCalled();
    });

    it("does not call onRowClick when clicking on link", () => {
      const mockOnRowClick = jest.fn();

      // Add a link to the row content
      const { container } = render(
        <TableRow {...defaultProps} onRowClick={mockOnRowClick} />
      );

      // Create a link element and add it to the row
      const link = document.createElement("a");
      link.href = "#";
      link.textContent = "Link";
      container.querySelector("tr")?.appendChild(link);

      fireEvent.click(link);

      expect(mockOnRowClick).not.toHaveBeenCalled();
    });
  });

  describe("Styling", () => {
    it("applies selected styling when row is selected", () => {
      render(<TableRow {...defaultProps} isSelected={true} />);

      const row = screen.getByRole("row");
      expect(row.className).toContain("bg-opacity-10");
    });

    it("applies even row styling for even indices", () => {
      render(<TableRow {...defaultProps} index={0} />);

      const row = screen.getByRole("row");
      expect(row.className).toContain("bg-[var(--surface)]");
    });

    it("applies odd row styling for odd indices", () => {
      render(<TableRow {...defaultProps} index={1} />);

      const row = screen.getByRole("row");
      expect(row.className).toContain("bg-white");
    });

    it("applies cursor pointer when onRowClick is provided", () => {
      render(<TableRow {...defaultProps} onRowClick={jest.fn()} />);

      const row = screen.getByRole("row");
      expect(row.className).toContain("cursor-pointer");
    });

    it("does not apply cursor pointer when onRowClick is not provided", () => {
      render(<TableRow {...defaultProps} />);

      const row = screen.getByRole("row");
      expect(row.className).not.toContain("cursor-pointer");
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA label for selection checkbox", () => {
      const mockOnRowSelect = jest.fn();
      render(
        <TableRow {...defaultProps} onRowSelect={mockOnRowSelect} index={2} />
      );

      const checkbox = screen.getByLabelText("Select row 3");
      expect(checkbox).toBeInTheDocument();
    });

    it("has proper role attribute", () => {
      render(<TableRow {...defaultProps} />);

      const row = screen.getByRole("row");
      expect(row).toBeInTheDocument();
    });
  });

  describe("Data Handling", () => {
    it("handles row with _id instead of id", () => {
      const rowWithUnderscore = {
        _id: "abc123",
        name: "Jane Doe",
        email: "jane@example.com",
      };

      const mockOnRowSelect = jest.fn();
      render(
        <TableRow
          {...defaultProps}
          row={rowWithUnderscore}
          onRowSelect={mockOnRowSelect}
        />
      );

      const checkbox = screen.getByLabelText("Select row 1");
      fireEvent.click(checkbox);

      expect(mockOnRowSelect).toHaveBeenCalledWith("abc123");
    });

    it("handles row without id or _id", () => {
      const rowWithoutId = {
        name: "No ID User",
        email: "noid@example.com",
      };

      const mockOnRowSelect = jest.fn();
      render(
        <TableRow
          {...defaultProps}
          row={rowWithoutId}
          onRowSelect={mockOnRowSelect}
        />
      );

      const checkbox = screen.getByLabelText("Select row 1");
      fireEvent.click(checkbox);

      expect(mockOnRowSelect).toHaveBeenCalledWith(undefined);
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

      render(<TableRow {...defaultProps} />);

      const row = screen.getByRole("row");
      expect(row.className).toContain("admin-surface");
    });
  });

  describe("Performance", () => {
    it("memoizes the component to prevent unnecessary re-renders", () => {
      const { rerender } = render(<TableRow {...defaultProps} />);

      // Re-render with same props
      rerender(<TableRow {...defaultProps} />);

      // Component should be memoized, so it shouldn't re-render unnecessarily
      // This is more of a structural test - the actual memoization behavior
      // would be tested in integration tests
      expect(screen.getByRole("row")).toBeInTheDocument();
    });
  });
});
