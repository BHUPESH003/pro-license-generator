# Admin DataTable Component

A powerful, reusable DataTable component built with AG Grid that provides server-side operations, URL state persistence, and CSV export functionality.

## Features

- **Server-side Operations**: Pagination, sorting, and filtering handled on the server
- **URL State Persistence**: Table state (filters, sorting, pagination) persisted in URL parameters
- **CSV Export**: Built-in export functionality with current filters applied
- **Flexible Filtering**: Support for text, select, and date filters
- **Action Buttons**: Configurable row actions with conditional visibility
- **Responsive Design**: Works on desktop and mobile devices
- **TypeScript Support**: Fully typed with TypeScript

## Basic Usage

```tsx
import { DataTable } from "@/components/admin";

const columns = [
  { field: "email", headerName: "Email", width: 200 },
  { field: "name", headerName: "Name", width: 150 },
  { field: "status", headerName: "Status", width: 120 },
];

function UsersTable() {
  return (
    <DataTable columns={columns} endpoint="/api/admin/users" pageSize={25} />
  );
}
```

## Advanced Usage with Filters and Actions

```tsx
import { DataTable, FilterConfig, ActionConfig } from "@/components/admin";

interface User {
  id: string;
  email: string;
  name: string;
  status: "active" | "inactive";
}

const columns = [
  { field: "email", headerName: "Email", width: 200 },
  { field: "name", headerName: "Name", width: 150 },
  { field: "status", headerName: "Status", width: 120 },
];

const filters: FilterConfig[] = [
  {
    field: "email",
    type: "text",
    label: "Email",
    placeholder: "Search by email...",
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

const actions: ActionConfig<User>[] = [
  {
    label: "Edit",
    onClick: (user) => console.log("Edit", user),
    variant: "primary",
  },
  {
    label: "Deactivate",
    onClick: (user) => console.log("Deactivate", user),
    variant: "error",
    condition: (user) => user.status === "active",
  },
];

function UsersTable() {
  return (
    <DataTable<User>
      columns={columns}
      endpoint="/api/admin/users"
      filters={filters}
      actions={actions}
      exportEnabled={true}
      defaultSort={{ field: "createdAt", direction: "desc" }}
      onRowClick={(user) => console.log("Row clicked", user)}
    />
  );
}
```

## Props

### DataTableProps<T>

| Prop            | Type                                            | Default | Description                    |
| --------------- | ----------------------------------------------- | ------- | ------------------------------ |
| `columns`       | `ColDef[]`                                      | -       | AG Grid column definitions     |
| `endpoint`      | `string`                                        | -       | API endpoint for data fetching |
| `filters`       | `FilterConfig[]`                                | `[]`    | Filter configurations          |
| `defaultSort`   | `{ field: string; direction: "asc" \| "desc" }` | -       | Default sorting                |
| `actions`       | `ActionConfig<T>[]`                             | `[]`    | Row action configurations      |
| `exportEnabled` | `boolean`                                       | `false` | Enable CSV export              |
| `pageSize`      | `number`                                        | `25`    | Number of rows per page        |
| `className`     | `string`                                        | `""`    | Additional CSS classes         |
| `onRowClick`    | `(row: T) => void`                              | -       | Row click handler              |

### FilterConfig

| Prop          | Type                                          | Description               |
| ------------- | --------------------------------------------- | ------------------------- |
| `field`       | `string`                                      | Field name to filter      |
| `type`        | `"text" \| "select" \| "date" \| "dateRange"` | Filter type               |
| `label`       | `string`                                      | Filter label              |
| `options`     | `Array<{ value: string; label: string }>`     | Options for select filter |
| `placeholder` | `string`                                      | Placeholder text          |

### ActionConfig<T>

| Prop        | Type                                  | Description            |
| ----------- | ------------------------------------- | ---------------------- |
| `label`     | `string`                              | Action button label    |
| `onClick`   | `(row: T) => void`                    | Click handler          |
| `variant`   | `"primary" \| "secondary" \| "error"` | Button variant         |
| `icon`      | `React.ReactNode`                     | Optional icon          |
| `condition` | `(row: T) => boolean`                 | Conditional visibility |

## Server-Side API Requirements

Your API endpoint should support the following query parameters:

### Request Parameters

- `page`: Current page number (1-based)
- `pageSize`: Number of items per page
- `sortBy`: Field to sort by
- `sortDir`: Sort direction ("asc" or "desc")
- `filter_<fieldName>`: Filter values for specific fields
- `export`: Set to "csv" for CSV export

### Response Format

```typescript
interface TableResponse<T> {
  success: boolean;
  data: {
    rows: T[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
```

### Example API Implementation

```typescript
// /api/admin/users/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "25");
  const sortBy = searchParams.get("sortBy");
  const sortDir = searchParams.get("sortDir") || "asc";

  // Build filter object
  const filters: any = {};
  for (const [key, value] of searchParams.entries()) {
    if (key.startsWith("filter_")) {
      const field = key.replace("filter_", "");
      filters[field] = value;
    }
  }

  // Handle CSV export
  if (searchParams.get("export") === "csv") {
    const csvData = await generateCSV(filters);
    return new Response(csvData, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=export.csv",
      },
    });
  }

  // Fetch data with pagination, sorting, and filtering
  const result = await fetchUsers({
    page,
    pageSize,
    sortBy,
    sortDir,
    filters,
  });

  return Response.json({
    success: true,
    data: result,
  });
}
```

## URL State Persistence

The DataTable automatically persists its state in URL parameters:

- `page`: Current page number
- `pageSize`: Items per page (if different from default)
- `sortBy`: Sort field
- `sortDir`: Sort direction
- `filter_<field>`: Filter values

This allows users to:

- Bookmark filtered/sorted views
- Share links with specific table states
- Use browser back/forward navigation
- Refresh the page without losing state

## Utility Functions

The component includes several utility functions for common use cases:

```typescript
import {
  createDateColumn,
  createStatusColumn,
  createCurrencyColumn,
  formatTableDate,
  formatCurrency,
  formatStatus,
} from "@/components/admin";

// Create pre-configured columns
const columns = [
  createDateColumn("createdAt", "Created", 150),
  createStatusColumn("status", "Status", 120),
  createCurrencyColumn("amount", "Amount", 120),
];
```

## Styling

The DataTable uses CSS custom properties for theming:

```css
:root {
  --primary: #3b82f6;
  --secondary: #f3f4f6;
  --surface: #ffffff;
  --border: #e5e7eb;
  --foreground: #111827;
  --muted-foreground: #6b7280;
}
```

The component is fully compatible with Tailwind CSS and follows the existing design system.

## Performance Considerations

- **Server-side Operations**: All heavy operations (filtering, sorting, pagination) are handled server-side
- **Caching**: AG Grid caches data blocks for better performance
- **Virtual Scrolling**: Only visible rows are rendered
- **Debounced Filters**: Text filters are debounced to reduce API calls
- **Optimized Re-renders**: Uses React.memo and useCallback for optimization

## Testing

The component includes comprehensive tests:

```bash
npm test -- DataTable.test.tsx
```

Tests cover:

- Component rendering
- Filter interactions
- Action button functionality
- URL state management
- Export functionality
- Error handling

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- `ag-grid-react`: Data grid functionality
- `ag-grid-community`: Core grid features
- `next/navigation`: URL state management
- React 18+ with hooks support
