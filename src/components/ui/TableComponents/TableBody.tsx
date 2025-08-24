"use client";

import React from "react";
import { DataTableColumn, ActionConfig } from "../CustomDataTable.types";
import { TableRow } from "./TableRow";
import { EmptyState } from "./EmptyState";
import { useAdminTheme } from "../../admin/AdminTheme";

interface TableBodyProps<T = any> {
  columns: DataTableColumn[];
  data: T[];
  actions?: ActionConfig<T>[];
  selectedRows: Set<string>;
  onRowClick?: (row: T) => void;
  onRowSelect?: (id: string) => void;
  loading: boolean;
  error: string | null;
  searchTerm?: string;
  highlightSearch?: boolean;
}

export const TableBody = React.memo(function TableBody<T = any>({
  columns,
  data,
  actions = [],
  selectedRows,
  onRowClick,
  onRowSelect,
  loading,
  error,
  searchTerm = "",
  highlightSearch = false,
}: TableBodyProps<T>) {
  const { isDark } = useAdminTheme();

  // Show empty state if no data and not loading
  if (!loading && !error && data.length === 0) {
    return (
      <tbody>
        <tr>
          <td
            colSpan={
              columns.length +
              (onRowSelect ? 1 : 0) +
              (actions.length > 0 ? 1 : 0)
            }
          >
            <EmptyState message="No data available" />
          </td>
        </tr>
      </tbody>
    );
  }

  // Show error state
  if (error && !loading) {
    return (
      <tbody>
        <tr>
          <td
            colSpan={
              columns.length +
              (onRowSelect ? 1 : 0) +
              (actions.length > 0 ? 1 : 0)
            }
          >
            <EmptyState
              message="Failed to load data"
              description={error}
              type="error"
            />
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody
      className={`
        divide-y
        ${isDark ? "divide-[var(--admin-border)]" : "divide-[var(--border)]"}
      `}
    >
      {data.map((row: any, index) => (
        <TableRow
          key={(row as any).id || (row as any)._id || index}
          row={row}
          columns={columns}
          actions={actions as any}
          isSelected={selectedRows.has((row as any).id || (row as any)._id)}
          onRowClick={onRowClick as any}
          onRowSelect={onRowSelect as any}
          index={index}
          searchTerm={searchTerm}
          highlightSearch={highlightSearch}
        />
      ))}
    </tbody>
  );
});

export default TableBody;
