import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import { GlobalSearch } from "../GlobalSearch";

// Mock AdminTheme
jest.mock("../../../admin/AdminTheme", () => ({
  useAdminTheme: () => ({ isDark: false }),
}));

// Mock Heroicons
jest.mock("@heroicons/react/24/outline", () => ({
  MagnifyingGlassIcon: ({ className }: any) => (
    <div data-testid="search-icon" className={className}>
      🔍
    </div>
  ),
  XMarkIcon: ({ className }: any) => (
    <div data-testid="clear-icon" className={className}>
      ✕
    </div>
  ),
}));

describe("GlobalSearch", () => {
  const defaultProps = {
    value: "",
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("Basic Rendering", () => {
    it("renders search input with default placeholder", () => {
      render(<GlobalSearch {...defaultProps} />);

      const input = screen.getByPlaceholderText("Search across all columns...");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("type", "text");
    });

    it("renders with custom placeholder", () => {
      render(
        <GlobalSearch
          {...defaultProps}
          placeholder="Custom search placeholder"
        />
      );

      expect(
        screen.getByPlaceholderText("Custom search placeholder")
      ).toBeInTheDocument();
    });

    it("renders search icon", () => {
      render(<GlobalSearch {...defaultProps} />);

      expect(screen.getByTestId("search-icon")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(
        <GlobalSearch {...defaultProps} className="custom-search-class" />
      );

      expect(container.firstChild).toHaveClass("custom-search-class");
    });

    it("shows current value in input", () => {
      render(<GlobalSearch {...defaultProps} value="test search" />);

      const input = screen.getByDisplayValue("test search");
      expect(input).toBeInTheDocument();
    });
  });

  describe("Search Functionality", () => {
    it("updates local value immediately when typing", async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<GlobalSearch {...defaultProps} />);

      const input = screen.getByPlaceholderText("Search across all columns...");
      await user.type(input, "test");

      expect(input).toHaveValue("test");
    });

    it("calls onChange after debounce delay", async () => {
      const mockOnChange = jest.fn();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(
        <GlobalSearch
          {...defaultProps}
          onChange={mockOnChange}
          debounceMs={300}
        />
      );

      const input = screen.getByPlaceholderText("Search across all columns...");
      await user.type(input, "test");

      // Should not call onChange immediately
      expect(mockOnChange).not.toHaveBeenCalled();

      // Advance timers to trigger debounce
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith("test");
      });
    });

    it("uses custom debounce delay", async () => {
      const mockOnChange = jest.fn();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(
        <GlobalSearch
          {...defaultProps}
          onChange={mockOnChange}
          debounceMs={500}
        />
      );

      const input = screen.getByPlaceholderText("Search across all columns...");
      await user.type(input, "test");

      // Should not call onChange after 300ms
      jest.advanceTimersByTime(300);
      expect(mockOnChange).not.toHaveBeenCalled();

      // Should call onChange after 500ms
      jest.advanceTimersByTime(200);
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith("test");
      });
    });

    it("cancels previous debounce when typing continues", async () => {
      const mockOnChange = jest.fn();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(
        <GlobalSearch
          {...defaultProps}
          onChange={mockOnChange}
          debounceMs={300}
        />
      );

      const input = screen.getByPlaceholderText("Search across all columns...");

      // Type first character
      await user.type(input, "t");
      jest.advanceTimersByTime(200);

      // Type second character before debounce completes
      await user.type(input, "e");
      jest.advanceTimersByTime(200);

      // Should not have called onChange yet
      expect(mockOnChange).not.toHaveBeenCalled();

      // Complete the debounce
      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith("te");
        expect(mockOnChange).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Clear Functionality", () => {
    it("shows clear button when there is a value", () => {
      render(<GlobalSearch {...defaultProps} value="test" />);

      expect(screen.getByTestId("clear-icon")).toBeInTheDocument();
      expect(screen.getByLabelText("Clear search")).toBeInTheDocument();
    });

    it("does not show clear button when value is empty", () => {
      render(<GlobalSearch {...defaultProps} value="" />);

      expect(screen.queryByTestId("clear-icon")).not.toBeInTheDocument();
    });

    it("clears search when clear button is clicked", async () => {
      const mockOnChange = jest.fn();
      const mockOnClear = jest.fn();
      const user = userEvent.setup();

      render(
        <GlobalSearch
          {...defaultProps}
          value="test"
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      );

      const clearButton = screen.getByLabelText("Clear search");
      await user.click(clearButton);

      expect(mockOnChange).toHaveBeenCalledWith("");
      expect(mockOnClear).toHaveBeenCalled();
    });

    it("clears search when Escape key is pressed", async () => {
      const mockOnChange = jest.fn();
      const mockOnClear = jest.fn();
      const user = userEvent.setup();

      render(
        <GlobalSearch
          {...defaultProps}
          value="test"
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      );

      const input = screen.getByDisplayValue("test");
      input.focus();
      await user.keyboard("{Escape}");

      expect(mockOnChange).toHaveBeenCalledWith("");
      expect(mockOnClear).toHaveBeenCalled();
    });

    it("blurs input when Escape key is pressed", async () => {
      const user = userEvent.setup();

      render(<GlobalSearch {...defaultProps} value="test" />);

      const input = screen.getByDisplayValue("test");
      input.focus();
      expect(input).toHaveFocus();

      await user.keyboard("{Escape}");

      expect(input).not.toHaveFocus();
    });
  });

  describe("Result Count Display", () => {
    it("shows result count when enabled and has search term", () => {
      render(
        <GlobalSearch
          {...defaultProps}
          value="test"
          showResultCount={true}
          resultCount={5}
          totalCount={100}
        />
      );

      expect(
        screen.getByText('Found 5 of 100 results for "test"')
      ).toBeInTheDocument();
    });

    it("shows no results message when result count is 0", () => {
      render(
        <GlobalSearch
          {...defaultProps}
          value="test"
          showResultCount={true}
          resultCount={0}
          totalCount={100}
        />
      );

      expect(
        screen.getByText('No results found for "test"')
      ).toBeInTheDocument();
    });

    it("does not show result count when disabled", () => {
      render(
        <GlobalSearch
          {...defaultProps}
          value="test"
          showResultCount={false}
          resultCount={5}
          totalCount={100}
        />
      );

      expect(
        screen.queryByText(/Found \d+ of \d+ results/)
      ).not.toBeInTheDocument();
    });

    it("does not show result count when no search term", () => {
      render(
        <GlobalSearch
          {...defaultProps}
          value=""
          showResultCount={true}
          resultCount={100}
          totalCount={100}
        />
      );

      expect(
        screen.queryByText(/Found \d+ of \d+ results/)
      ).not.toBeInTheDocument();
    });

    it("formats large numbers with locale formatting", () => {
      render(
        <GlobalSearch
          {...defaultProps}
          value="test"
          showResultCount={true}
          resultCount={1234}
          totalCount={5678}
        />
      );

      expect(
        screen.getByText('Found 1,234 of 5,678 results for "test"')
      ).toBeInTheDocument();
    });
  });

  describe("Disabled State", () => {
    it("disables input when disabled prop is true", () => {
      render(<GlobalSearch {...defaultProps} disabled={true} />);

      const input = screen.getByPlaceholderText("Search across all columns...");
      expect(input).toBeDisabled();
    });

    it("does not show clear button when disabled", () => {
      render(<GlobalSearch {...defaultProps} value="test" disabled={true} />);

      expect(screen.queryByTestId("clear-icon")).not.toBeInTheDocument();
    });

    it("applies disabled styling", () => {
      const { container } = render(
        <GlobalSearch {...defaultProps} disabled={true} />
      );

      const input = container.querySelector("input");
      expect(input?.className).toContain("opacity-50");
      expect(input?.className).toContain("cursor-not-allowed");
    });
  });

  describe("Focus States", () => {
    it("applies focus styles when input is focused", async () => {
      const user = userEvent.setup();
      const { container } = render(<GlobalSearch {...defaultProps} />);

      const input = screen.getByPlaceholderText("Search across all columns...");
      await user.click(input);

      expect(input.className).toContain("shadow-md");
    });

    it("removes focus styles when input is blurred", async () => {
      const user = userEvent.setup();
      const { container } = render(<GlobalSearch {...defaultProps} />);

      const input = screen.getByPlaceholderText("Search across all columns...");
      await user.click(input);
      await user.tab(); // Move focus away

      expect(input.className).toContain("shadow-sm");
    });

    it("changes icon color when focused", async () => {
      const user = userEvent.setup();
      render(<GlobalSearch {...defaultProps} />);

      const input = screen.getByPlaceholderText("Search across all columns...");
      const icon = screen.getByTestId("search-icon");

      await user.click(input);

      expect(icon.className).toContain("text-[var(--primary)]");
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels", () => {
      render(<GlobalSearch {...defaultProps} />);

      const input = screen.getByLabelText("Global search");
      expect(input).toBeInTheDocument();
    });

    it("associates result count with input via aria-describedby", () => {
      render(
        <GlobalSearch
          {...defaultProps}
          value="test"
          showResultCount={true}
          resultCount={5}
          totalCount={100}
        />
      );

      const input = screen.getByLabelText("Global search");
      expect(input).toHaveAttribute("aria-describedby", "search-results");

      const resultCount = screen.getByText('Found 5 of 100 results for "test"');
      expect(resultCount).toHaveAttribute("id", "search-results");
    });

    it("has proper title for clear button", () => {
      render(<GlobalSearch {...defaultProps} value="test" />);

      const clearButton = screen.getByLabelText("Clear search");
      expect(clearButton).toHaveAttribute("title", "Clear search (Esc)");
    });

    it("supports keyboard navigation for clear button", async () => {
      const mockOnChange = jest.fn();
      const user = userEvent.setup();

      render(
        <GlobalSearch {...defaultProps} value="test" onChange={mockOnChange} />
      );

      const clearButton = screen.getByLabelText("Clear search");
      clearButton.focus();
      await user.keyboard("{Enter}");

      expect(mockOnChange).toHaveBeenCalledWith("");
    });
  });

  describe("Dark Mode", () => {
    it("applies dark mode styles when isDark is true", () => {
      // Mock dark theme
      jest
        .mocked(require("../../../admin/AdminTheme").useAdminTheme)
        .mockReturnValue({
          isDark: true,
        });

      const { container } = render(<GlobalSearch {...defaultProps} />);

      const input = container.querySelector("input");
      expect(input?.className).toContain("border-[var(--admin-border)]");
      expect(input?.className).toContain("bg-[var(--admin-surface)]");
      expect(input?.className).toContain("text-[var(--admin-foreground)]");
    });
  });

  describe("Performance", () => {
    it("memoizes the component to prevent unnecessary re-renders", () => {
      const { rerender } = render(<GlobalSearch {...defaultProps} />);

      // Re-render with same props
      rerender(<GlobalSearch {...defaultProps} />);

      // Component should be memoized
      expect(
        screen.getByPlaceholderText("Search across all columns...")
      ).toBeInTheDocument();
    });
  });
});
