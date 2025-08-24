# Design Document

## Overview

This design addresses three critical bugs in the MyCleanOne Admin Panel's DataTable component: dark theme support, action button event propagation, and filter state synchronization issues. The solution maintains the existing architecture while implementing targeted fixes that ensure proper functionality across all admin interfaces.

## Architecture

### Current Architecture Analysis

The DataTable component uses:

- **AG Grid**: For table rendering and basic functionality
- **useTableState Hook**: For URL-synchronized state management
- **Server-side Operations**: For pagination, sorting, and filtering
- **Custom Action Renderers**: For row-level actions

### Problem Analysis

1. **Dark Theme Issue**: AG Grid uses hardcoded `ag-theme-alpine` class without dynamic theme switching
2. **Action Button Issue**: Action buttons don't prevent event bubbling to row click handlers
3. **Filter State Issue**: React state updates are asynchronous, causing API calls with stale filter data

## Components and Interfaces

### Enhanced DataTable Component

#### Theme Integration

```typescript
// Enhanced theme detection and application
interface ThemeConfig {
  isDark: boolean;
  agGridTheme: string;
  customClasses: string;
}

function useDataTableTheme(): ThemeConfig {
  const { isDark } = useAdminTheme();

  return {
    isDark,
    agGridTheme: isDark ? "ag-theme-alpine-dark" : "ag-theme-alpine",
    customClasses: isDark ? "dark-table-wrapper" : "light-table-wrapper",
  };
}
```

#### Action Cell Renderer Enhancement

```typescript
// Enhanced action cell renderer with proper event handling
const ActionCellRenderer = useCallback(
  (props: any) => {
    const row = props.data;

    const handleActionClick = (
      e: React.MouseEvent,
      action: ActionConfig<T>
    ) => {
      // Prevent event bubbling to row click
      e.stopPropagation();
      e.preventDefault();

      // Execute action
      action.onClick(row);
    };

    return (
      <div
        className="flex gap-2 p-1"
        onClick={(e) => e.stopPropagation()} // Additional safety
      >
        {actions.map((action, index) => {
          if (action.condition && !action.condition(row)) {
            return null;
          }

          return (
            <button
              key={index}
              className={getActionButtonClasses(action.variant, isDark)}
              onClick={(e) => handleActionClick(e, action)}
              onMouseDown={(e) => e.stopPropagation()} // Prevent mousedown bubbling
            >
              {action.label}
            </button>
          );
        })}
      </div>
    );
  },
  [actions, isDark]
);
```

### Enhanced useTableState Hook

#### Filter State Synchronization

```typescript
// Enhanced state management with immediate API calls
export function useTableState(options: UseTableStateOptions = {}) {
  const { defaultPageSize = 25, defaultSort } = options;
  const router = useRouter();
  const searchParams = useSearchParams();

  // Separate state for immediate API calls
  const [pendingFilters, setPendingFilters] = useState<Record<string, any>>({});
  const [tableState, setTableState] = useState<TableState>(() =>
    parseTableStateFromUrl(searchParams, defaultPageSize, defaultSort)
  );

  // Enhanced filter update with immediate effect
  const updateFilters = useCallback(
    (filters: Record<string, any>) => {
      // Update pending filters immediately for API calls
      setPendingFilters(filters);

      // Update table state and URL
      const newState = { ...tableState, filters, page: 1 };
      setTableState(newState);
      updateUrl({ filters, page: 1 });
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

  return {
    tableState,
    getCurrentFilters,
    clearPendingFilters,
    updateFilters,
    updateSort,
    updatePagination,
    clearFilters,
    resetToFirstPage,
  };
}
```

### Enhanced DataTable Implementation

#### Improved Data Fetching

```typescript
// Enhanced fetch data with proper filter handling
const fetchData = useCallback(async () => {
  setLoading(true);

  try {
    const queryParams = new URLSearchParams();

    // Use current filters (including pending ones)
    const currentFilters = getCurrentFilters();

    // Pagination
    queryParams.set("page", tableState.page.toString());
    queryParams.set("pageSize", pageSize.toString());

    // Sorting
    if (tableState.sortBy && tableState.sortDir) {
      queryParams.set("sortBy", tableState.sortBy);
      queryParams.set("sortDir", tableState.sortDir);
    }

    // Filtering - use current filters
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.set(`filter_${key}`, value.toString());
      }
    });

    const { data } = await apiClient.get(`${endpoint}`, {
      params: Object.fromEntries(queryParams.entries()),
    });

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch data");
    }

    setRowData(data.data.rows);
    setTotalRows(data.data.total);

    // Clear pending filters after successful fetch
    clearPendingFilters();
  } catch (error) {
    console.error("Error fetching data:", error);
    setRowData([]);
    setTotalRows(0);
  } finally {
    setLoading(false);
  }
}, [endpoint, tableState, pageSize, getCurrentFilters, clearPendingFilters]);
```

#### Debounced Filter Updates

```typescript
// Debounced filter handling for text inputs
const debouncedFilterUpdate = useMemo(
  () =>
    debounce((field: string, value: any) => {
      updateFilters({ ...getCurrentFilters(), [field]: value });
    }, 300),
  [updateFilters, getCurrentFilters]
);

const handleFilterChange = useCallback(
  (field: string, value: any) => {
    // For text inputs, use debounced updates
    if (typeof value === "string") {
      debouncedFilterUpdate(field, value);
    } else {
      // For selects and dates, update immediately
      updateFilters({ ...getCurrentFilters(), [field]: value });
    }

    updatePagination(1); // Reset to first page when filtering

    // Notify parent component of filter changes
    if (onFiltersChange) {
      onFiltersChange({ ...getCurrentFilters(), [field]: value });
    }
  },
  [
    debouncedFilterUpdate,
    updateFilters,
    getCurrentFilters,
    updatePagination,
    onFiltersChange,
  ]
);
```

## Data Models

### Theme Configuration

```typescript
// CSS custom properties for AG Grid dark theme
const agGridDarkTheme = `
  .ag-theme-alpine-dark {
    --ag-background-color: var(--admin-surface);
    --ag-header-background-color: var(--admin-background);
    --ag-odd-row-background-color: var(--admin-surface);
    --ag-row-hover-color: rgba(59, 130, 246, 0.1);
    --ag-border-color: var(--admin-border);
    --ag-header-column-separator-color: var(--admin-border);
    --ag-font-color: var(--admin-foreground);
    --ag-secondary-font-color: var(--admin-muted);
    --ag-input-background-color: var(--admin-surface);
    --ag-input-border-color: var(--admin-border);
    --ag-input-focus-border-color: var(--admin-primary);
    --ag-checkbox-background-color: var(--admin-surface);
    --ag-checkbox-border-color: var(--admin-border);
    --ag-range-selection-background-color: rgba(59, 130, 246, 0.2);
  }

  .dark-table-wrapper .ag-root-wrapper {
    border-color: var(--admin-border);
  }

  .dark-table-wrapper .ag-header {
    border-bottom-color: var(--admin-border);
  }

  .dark-table-wrapper .ag-cell {
    border-right-color: var(--admin-border);
  }
`;
```

### Filter State Management

```typescript
// Enhanced filter state interface
interface FilterState {
  applied: Record<string, any>; // Currently applied filters (in URL)
  pending: Record<string, any>; // Pending filters (for immediate API calls)
  debounced: Record<string, any>; // Debounced filter values (for text inputs)
}

interface TableStateEnhanced extends TableState {
  filterState: FilterState;
}
```

## Error Handling

### Filter Synchronization Error Recovery

```typescript
// Error recovery for filter state issues
const handleFilterError = useCallback(
  (error: Error, filters: Record<string, any>) => {
    console.error("Filter synchronization error:", error);

    // Reset to known good state
    clearPendingFilters();

    // Retry with current table state filters
    setTimeout(() => {
      fetchData();
    }, 1000);

    // Show user notification
    showNotification({
      type: "warning",
      message: "Filter update failed, retrying...",
    });
  },
  [clearPendingFilters, fetchData, showNotification]
);
```

### Theme Fallback

```typescript
// Theme fallback mechanism
const getThemeWithFallback = (isDark: boolean): string => {
  try {
    // Check if dark theme CSS is loaded
    const darkThemeLoaded = document.querySelector(".ag-theme-alpine-dark");

    if (isDark && !darkThemeLoaded) {
      console.warn("Dark theme not loaded, falling back to light theme");
      return "ag-theme-alpine";
    }

    return isDark ? "ag-theme-alpine-dark" : "ag-theme-alpine";
  } catch (error) {
    console.error("Theme detection error:", error);
    return "ag-theme-alpine"; // Safe fallback
  }
};
```

## Testing Strategy

### Unit Tests

```typescript
// Test filter state synchronization
describe("useTableState filter synchronization", () => {
  it("should use pending filters for immediate API calls", () => {
    const { result } = renderHook(() => useTableState());

    act(() => {
      result.current.updateFilters({ status: "active" });
    });

    expect(result.current.getCurrentFilters()).toEqual({ status: "active" });
  });

  it("should clear pending filters after successful API call", () => {
    const { result } = renderHook(() => useTableState());

    act(() => {
      result.current.updateFilters({ status: "active" });
      result.current.clearPendingFilters();
    });

    expect(result.current.getCurrentFilters()).toEqual(
      result.current.tableState.filters
    );
  });
});

// Test action button event handling
describe("ActionCellRenderer", () => {
  it("should prevent row click when action button is clicked", () => {
    const mockRowClick = jest.fn();
    const mockActionClick = jest.fn();

    render(
      <div onClick={mockRowClick}>
        <ActionCellRenderer
          data={{ id: 1 }}
          actions={[{ label: "Test", onClick: mockActionClick }]}
        />
      </div>
    );

    fireEvent.click(screen.getByText("Test"));

    expect(mockActionClick).toHaveBeenCalled();
    expect(mockRowClick).not.toHaveBeenCalled();
  });
});
```

### Integration Tests

```typescript
// Test complete filter workflow
describe("DataTable filter integration", () => {
  it("should make API call with latest filters immediately", async () => {
    const mockApiCall = jest.fn();

    render(<DataTable endpoint="/test" onApiCall={mockApiCall} />);

    // Apply filter
    fireEvent.change(screen.getByPlaceholderText("Filter..."), {
      target: { value: "test" },
    });

    // Wait for debounce
    await waitFor(() => {
      expect(mockApiCall).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            filter_field: "test",
          }),
        })
      );
    });
  });
});
```

### E2E Tests

```typescript
// Test theme switching
test("DataTable should switch themes correctly", async ({ page }) => {
  await page.goto("/admin/licenses");

  // Check light theme
  await expect(page.locator(".ag-theme-alpine")).toBeVisible();

  // Switch to dark theme
  await page.click('[data-testid="theme-toggle"]');

  // Check dark theme
  await expect(page.locator(".ag-theme-alpine-dark")).toBeVisible();
});

// Test action button isolation
test("Action buttons should not trigger row clicks", async ({ page }) => {
  await page.goto("/admin/licenses");

  // Click action button
  await page.click('[data-testid="license-action-deactivate"]');

  // Verify drawer didn't open
  await expect(
    page.locator('[data-testid="license-detail-drawer"]')
  ).not.toBeVisible();

  // Verify action dialog opened instead
  await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible();
});
```

## Performance Optimizations

### Filter Debouncing

```typescript
// Optimized debouncing for different filter types
const getDebounceDelay = (filterType: string): number => {
  switch (filterType) {
    case "text":
      return 300;
    case "select":
      return 0;
    case "date":
      return 0;
    default:
      return 150;
  }
};

const createDebouncedFilter = (type: string) => {
  return debounce((field: string, value: any, callback: Function) => {
    callback(field, value);
  }, getDebounceDelay(type));
};
```

### Theme Switching Optimization

```typescript
// Memoized theme configuration
const themeConfig = useMemo(
  () => ({
    agGridTheme: isDark ? "ag-theme-alpine-dark" : "ag-theme-alpine",
    wrapperClasses: `w-full ${
      isDark ? "dark-table-wrapper" : "light-table-wrapper"
    }`,
    customStyles: isDark ? agGridDarkTheme : "",
  }),
  [isDark]
);
```

## Implementation Approach

### Phase 1: Theme Support

1. Add AG Grid dark theme CSS
2. Integrate with AdminTheme context
3. Update DataTable to use dynamic theme classes
4. Test theme switching across all admin pages

### Phase 2: Action Button Fix

1. Enhance ActionCellRenderer with proper event handling
2. Add multiple event prevention layers
3. Test action buttons across all admin tables
4. Verify row click functionality remains intact

### Phase 3: Filter State Fix

1. Implement pending filter state management
2. Update useTableState hook with immediate filter access
3. Add debouncing for text inputs
4. Update fetchData to use current filters
5. Test filter synchronization across all scenarios

### Phase 4: Integration & Testing

1. Apply fixes to all DataTable instances
2. Run comprehensive testing suite
3. Verify backward compatibility
4. Performance testing with large datasets

This design ensures that all three critical bugs are addressed while maintaining the existing architecture and functionality of the DataTable component across all admin interfaces.
