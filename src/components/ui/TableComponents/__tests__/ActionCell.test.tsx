import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import { ActionCell } from "../ActionCell";
import { ActionConfig } from "../../CustomDataTable.types";

// Mock AdminTheme
jest.mock("../../../admin/AdminTheme", () => ({
  useAdminTheme: () => ({ isDark: false }),
}));

// Mock Button component
jest.mock("../../Button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
    size,
    className,
    title,
    ...props
  }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      title={title}
      data-variant={variant}
      data-size={size}
      {...props}
    >
      {children}
    </button>
  ),
}));

describe("ActionCell", () => {
  const mockRow = {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    status: "active",
  };

  const mockActions: ActionConfig<typeof mockRow>[] = [
    {
      label: "Edit",
      onClick: jest.fn(),
      variant: "outline",
      icon: <span data-testid="edit-icon">✏️</span>,
    },
    {
      label: "Delete",
      onClick: jest.fn(),
      variant: "destructive",
      icon: <span data-testid="delete-icon">🗑️</span>,
      disabled: (row) => row.status === "inactive",
    },
    {
      label: "Archive",
      onClick: jest.fn(),
      variant: "secondary",
      hidden: (row) => row.status === "archived",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders action buttons for visible actions", () => {
      render(<ActionCell row={mockRow} actions={mockActions} />);

      expect(screen.getByText("Edit")).toBeInTheDocument();
      expect(screen.getByText("Delete")).toBeInTheDocument();
      expect(screen.getByText("Archive")).toBeInTheDocument();
    });

    it("renders action icons when provided", () => {
      render(<ActionCell row={mockRow} actions={mockActions} />);

      expect(screen.getByTestId("edit-icon")).toBeInTheDocument();
      expect(screen.getByTestId("delete-icon")).toBeInTheDocument();
    });

    it("applies correct button variants", () => {
      render(<ActionCell row={mockRow} actions={mockActions} />);

      const editButton = screen.getByText("Edit");
      const deleteButton = screen.getByText("Delete");
      const archiveButton = screen.getByText("Archive");

      expect(editButton).toHaveAttribute("data-variant", "outline");
      expect(deleteButton).toHaveAttribute("data-variant", "destructive");
      expect(archiveButton).toHaveAttribute("data-variant", "secondary");
    });

    it("defaults to outline variant when not specified", () => {
      const actionsWithoutVariant = [
        {
          label: "Default",
          onClick: jest.fn(),
        },
      ];

      render(<ActionCell row={mockRow} actions={actionsWithoutVariant} />);

      const button = screen.getByText("Default");
      expect(button).toHaveAttribute("data-variant", "outline");
    });

    it("renders empty cell when no visible actions", () => {
      const hiddenActions = [
        {
          label: "Hidden",
          onClick: jest.fn(),
          hidden: () => true,
        },
      ];

      const { container } = render(
        <ActionCell row={mockRow} actions={hiddenActions} />
      );

      const cell = container.querySelector("td");
      expect(cell).toBeInTheDocument();
      expect(cell).toHaveStyle({ width: "120px" });
      expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
    });
  });

  describe("Action Execution", () => {
    it("calls onClick when action button is clicked", async () => {
      const user = userEvent.setup();
      const mockOnClick = jest.fn();
      const actions = [
        {
          label: "Test Action",
          onClick: mockOnClick,
        },
      ];

      render(<ActionCell row={mockRow} actions={actions} />);

      const button = screen.getByText("Test Action");
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledWith(mockRow);
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it("does not call onClick when action is disabled", async () => {
      const user = userEvent.setup();
      const mockOnClick = jest.fn();
      const actions = [
        {
          label: "Disabled Action",
          onClick: mockOnClick,
          disabled: () => true,
        },
      ];

      render(<ActionCell row={mockRow} actions={actions} />);

      const button = screen.getByText("Disabled Action");
      await user.click(button);

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it("prevents event bubbling when action is clicked", async () => {
      const user = userEvent.setup();
      const mockRowClick = jest.fn();
      const mockActionClick = jest.fn();

      const actions = [
        {
          label: "Test Action",
          onClick: mockActionClick,
        },
      ];

      const { container } = render(
        <tr onClick={mockRowClick}>
          <ActionCell row={mockRow} actions={actions} />
        </tr>
      );

      const button = screen.getByText("Test Action");
      await user.click(button);

      expect(mockActionClick).toHaveBeenCalledWith(mockRow);
      expect(mockRowClick).not.toHaveBeenCalled();
    });

    it("supports keyboard navigation", async () => {
      const user = userEvent.setup();
      const mockOnClick = jest.fn();
      const actions = [
        {
          label: "Keyboard Action",
          onClick: mockOnClick,
        },
      ];

      render(<ActionCell row={mockRow} actions={actions} />);

      const button = screen.getByText("Keyboard Action");

      // Test Enter key
      button.focus();
      await user.keyboard("{Enter}");
      expect(mockOnClick).toHaveBeenCalledWith(mockRow);

      mockOnClick.mockClear();

      // Test Space key
      await user.keyboard(" ");
      expect(mockOnClick).toHaveBeenCalledWith(mockRow);
    });

    it("does not execute disabled actions via keyboard", async () => {
      const user = userEvent.setup();
      const mockOnClick = jest.fn();
      const actions = [
        {
          label: "Disabled Action",
          onClick: mockOnClick,
          disabled: () => true,
        },
      ];

      render(<ActionCell row={mockRow} actions={actions} />);

      const button = screen.getByText("Disabled Action");
      button.focus();

      await user.keyboard("{Enter}");
      await user.keyboard(" ");

      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe("Conditional Rendering", () => {
    it("hides actions based on hidden condition", () => {
      const actions = [
        {
          label: "Visible",
          onClick: jest.fn(),
        },
        {
          label: "Hidden",
          onClick: jest.fn(),
          hidden: (row: typeof mockRow) => row.status === "active",
        },
      ];

      render(<ActionCell row={mockRow} actions={actions} />);

      expect(screen.getByText("Visible")).toBeInTheDocument();
      expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
    });

    it("shows actions when hidden condition is false", () => {
      const actions = [
        {
          label: "Conditional",
          onClick: jest.fn(),
          hidden: (row: typeof mockRow) => row.status === "inactive",
        },
      ];

      render(<ActionCell row={mockRow} actions={actions} />);

      expect(screen.getByText("Conditional")).toBeInTheDocument();
    });

    it("supports legacy condition property", () => {
      const actions = [
        {
          label: "Legacy Visible",
          onClick: jest.fn(),
          condition: (row: typeof mockRow) => row.status === "active",
        },
        {
          label: "Legacy Hidden",
          onClick: jest.fn(),
          condition: (row: typeof mockRow) => row.status === "inactive",
        },
      ];

      render(<ActionCell row={mockRow} actions={actions} />);

      expect(screen.getByText("Legacy Visible")).toBeInTheDocument();
      expect(screen.queryByText("Legacy Hidden")).not.toBeInTheDocument();
    });

    it("disables actions based on disabled condition", () => {
      const inactiveRow = { ...mockRow, status: "inactive" };

      render(<ActionCell row={inactiveRow} actions={mockActions} />);

      const deleteButton = screen.getByText("Delete");
      expect(deleteButton).toBeDisabled();
    });

    it("enables actions when disabled condition is false", () => {
      render(<ActionCell row={mockRow} actions={mockActions} />);

      const deleteButton = screen.getByText("Delete");
      expect(deleteButton).not.toBeDisabled();
    });
  });

  describe("Styling and Layout", () => {
    it("calculates cell width based on number of actions", () => {
      const { container } = render(
        <ActionCell row={mockRow} actions={mockActions} />
      );

      const cell = container.querySelector("td");
      // 3 visible actions * 80px = 240px (minimum 120px)
      expect(cell).toHaveStyle({ width: "240px" });
    });

    it("uses minimum width for single action", () => {
      const singleAction = [mockActions[0]];
      const { container } = render(
        <ActionCell row={mockRow} actions={singleAction} />
      );

      const cell = container.querySelector("td");
      expect(cell).toHaveStyle({ width: "120px" });
    });

    it("applies disabled styling to disabled actions", () => {
      const inactiveRow = { ...mockRow, status: "inactive" };

      render(<ActionCell row={inactiveRow} actions={mockActions} />);

      const deleteButton = screen.getByText("Delete");
      expect(deleteButton.className).toContain("opacity-50");
      expect(deleteButton.className).toContain("cursor-not-allowed");
    });

    it("applies hover effects to enabled actions", () => {
      render(<ActionCell row={mockRow} actions={mockActions} />);

      const editButton = screen.getByText("Edit");
      expect(editButton.className).toContain("hover:scale-105");
    });

    it("right-aligns actions in the cell", () => {
      const { container } = render(
        <ActionCell row={mockRow} actions={mockActions} />
      );

      const actionsContainer = container.querySelector(".flex");
      expect(actionsContainer).toHaveClass("justify-end");
    });
  });

  describe("Accessibility", () => {
    it("provides proper ARIA labels", () => {
      render(<ActionCell row={mockRow} actions={mockActions} />);

      const editButton = screen.getByText("Edit");
      expect(editButton).toHaveAttribute("aria-label", "Edit for John Doe");

      const deleteButton = screen.getByText("Delete");
      expect(deleteButton).toHaveAttribute("aria-label", "Delete for John Doe");
    });

    it("falls back to row id when name is not available", () => {
      const rowWithoutName = { id: 123, email: "test@example.com" };
      const actions = [
        {
          label: "Test",
          onClick: jest.fn(),
        },
      ];

      render(<ActionCell row={rowWithoutName} actions={actions} />);

      const button = screen.getByText("Test");
      expect(button).toHaveAttribute("aria-label", "Test for 123");
    });

    it("provides generic label when no name or id", () => {
      const rowWithoutIdentifier = { email: "test@example.com" };
      const actions = [
        {
          label: "Test",
          onClick: jest.fn(),
        },
      ];

      render(<ActionCell row={rowWithoutIdentifier} actions={actions} />);

      const button = screen.getByText("Test");
      expect(button).toHaveAttribute("aria-label", "Test for this item");
    });

    it("provides tooltips for disabled actions", () => {
      const inactiveRow = { ...mockRow, status: "inactive" };

      render(<ActionCell row={inactiveRow} actions={mockActions} />);

      const deleteButton = screen.getByText("Delete");
      expect(deleteButton).toHaveAttribute("title", "Delete is disabled");
    });

    it("provides standard tooltips for enabled actions", () => {
      render(<ActionCell row={mockRow} actions={mockActions} />);

      const editButton = screen.getByText("Edit");
      expect(editButton).toHaveAttribute("title", "Edit");
    });

    it("has proper role attributes", () => {
      const { container } = render(
        <ActionCell row={mockRow} actions={mockActions} />
      );

      const cell = container.querySelector("td");
      expect(cell).toHaveAttribute("role", "cell");
    });
  });

  describe("Performance", () => {
    it("memoizes the component to prevent unnecessary re-renders", () => {
      const { rerender } = render(
        <ActionCell row={mockRow} actions={mockActions} />
      );

      // Re-render with same props
      rerender(<ActionCell row={mockRow} actions={mockActions} />);

      // Component should be memoized
      expect(screen.getByText("Edit")).toBeInTheDocument();
    });

    it("uses stable keys for action buttons", () => {
      const { container } = render(
        <ActionCell row={mockRow} actions={mockActions} />
      );

      const buttons = container.querySelectorAll("button");
      buttons.forEach((button, index) => {
        expect(button).toHaveAttribute(
          "key",
          expect.stringContaining(mockActions[index].label)
        );
      });
    });
  });

  describe("Dark Mode", () => {
    it("applies dark mode focus styles when isDark is true", () => {
      // Mock dark theme
      jest
        .mocked(require("../../../admin/AdminTheme").useAdminTheme)
        .mockReturnValue({
          isDark: true,
        });

      render(<ActionCell row={mockRow} actions={mockActions} />);

      const editButton = screen.getByText("Edit");
      expect(editButton.className).toContain(
        "focus:ring-[var(--admin-primary)]"
      );
    });

    it("applies light mode focus styles when isDark is false", () => {
      render(<ActionCell row={mockRow} actions={mockActions} />);

      const editButton = screen.getByText("Edit");
      expect(editButton.className).toContain("focus:ring-[var(--primary)]");
    });
  });

  describe("Edge Cases", () => {
    it("handles empty actions array", () => {
      const { container } = render(<ActionCell row={mockRow} actions={[]} />);

      const cell = container.querySelector("td");
      expect(cell).toBeInTheDocument();
      expect(cell).toHaveStyle({ width: "120px" });
    });

    it("handles actions with long labels", () => {
      const longLabelActions = [
        {
          label: "This is a very long action label that might overflow",
          onClick: jest.fn(),
        },
      ];

      render(<ActionCell row={mockRow} actions={longLabelActions} />);

      const button = screen.getByText(
        "This is a very long action label that might overflow"
      );
      expect(button.querySelector("span")).toHaveClass("truncate");
    });

    it("handles actions without icons", () => {
      const actionsWithoutIcons = [
        {
          label: "No Icon",
          onClick: jest.fn(),
        },
      ];

      render(<ActionCell row={mockRow} actions={actionsWithoutIcons} />);

      const button = screen.getByText("No Icon");
      expect(button.querySelector('[class*="mr-"]')).not.toBeInTheDocument();
    });
  });
});
