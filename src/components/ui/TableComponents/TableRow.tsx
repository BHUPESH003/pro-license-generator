"use client";

import React, { useCallback } from "react";
import { DataTableColumn, ActionConfig } from "../CustomDataTable.types";
import { TableCell } from "./TableCell";
import { ActionCell } from "./ActionCell";
import { useAdminTheme } from "../../admin/AdminTheme";

interface TableRowProps<T = any> {
  row: T;
  columns: DataTableColumn[];
  actions?: ActionConfig<T>[];
  isSelected: boolean;
  onRowClick?: (row: T) => void;
  onRowSelect?: (id: string) => void;
  index: number;
  searchTerm?: string;
  highlightSearch?: boolean;
}

export const TableRow = React.memo(function TableRow<T = any>({
  row,
  columns,
  actions = [],
  isSelected,
  onRowClick,
  onRowSelect,
  index,
  searchTerm = "",
  highlightSearch = false,
}: TableRowProps<T>) {
  const { isDark } = useAdminTheme();

  // Safely get nested values using dot notation in column.field (e.g., "user.email")
  const getNestedValue = useCallback((obj: any, path: string) => {
    if (!obj || !path) return undefined;
    if (path.indexOf(".") === -1) return obj[path];
    return path.split(".").reduce((acc: any, key: string) => {
      if (acc == null) return undefined;
      return acc[key];
    }, obj);
  }, []);

  const handleRowClick = useCallback(
    (e: React.MouseEvent) => {
      // Don't trigger row click if clicking on interactive elements
      const target = e.target as HTMLElement;
      if (
        target.tagName === "BUTTON" ||
        target.tagName === "INPUT" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("input") ||
        target.closest("a")
      ) {
        return;
      }

      if (onRowClick) {
        onRowClick(row);
      }
    },
    [row, onRowClick]
  );

  const handleSelectChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      if (onRowSelect) {
        onRowSelect((row as any).id || (row as any)._id);
      }
    },
    [row, onRowSelect]
  );

  const rowClasses = `
    transition-colors
    ${onRowClick ? "cursor-pointer" : ""}
    ${
      isSelected
        ? isDark
          ? "bg-[var(--admin-primary)] bg-opacity-20"
          : "bg-[var(--primary)] bg-opacity-10"
        : index % 2 === 0
          ? isDark
            ? "bg-[var(--admin-surface)]"
            : "bg-[var(--surface)]"
          : isDark
            ? "bg-[var(--admin-background)]"
            : "bg-white"
    }
    ${
      isDark
        ? "hover:bg-[var(--admin-primary)] hover:bg-opacity-10"
        : "hover:bg-[var(--primary)] hover:bg-opacity-5"
    }
  `;

  return (
    <tr className={rowClasses} onClick={handleRowClick}>
      {/* Selection Column */}
      {onRowSelect && (
        <td className="px-4 py-3" style={{ width: "50px" }}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelectChange}
            onClick={(e) => e.stopPropagation()}
            className={`
              rounded border-2 focus:ring-2 focus:ring-offset-0
              ${
                isDark
                  ? "border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-primary)] focus:ring-[var(--admin-primary)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--primary)] focus:ring-[var(--primary)]"
              }
            `}
            aria-label={`Select row ${index + 1}`}
          />
        </td>
      )}

      {/* Data Columns */}
      {columns.map((column) => {
        const rawValue = column.valueGetter
          ? column.valueGetter(row)
          : getNestedValue(row as any, column.field);
        const value = rawValue === undefined ? null : rawValue;
        return (
          <TableCell
            key={column.field}
            column={column}
            row={row}
            value={value}
            searchTerm={searchTerm}
            highlightSearch={highlightSearch}
          />
        );
      })}

      {/* Actions Column */}
      {actions.length > 0 && <ActionCell row={row as any} actions={actions as any} />}
    </tr>
  );
});

export default TableRow;
