"use client";

import React, { useCallback } from "react";
import { DataTableColumn } from "../CustomDataTable.types";
import { useAdminTheme } from "../../admin/AdminTheme";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

interface TableHeaderProps {
  columns: DataTableColumn[];
  sortBy?: string;
  sortDir?: "asc" | "desc";
  onSort: (field: string, direction: "asc" | "desc") => void;
  selectionEnabled?: boolean;
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  stickyHeader?: boolean;
}

export const TableHeader = React.memo(function TableHeader({
  columns,
  sortBy,
  sortDir,
  onSort,
  selectionEnabled = false,
  selectedCount,
  totalCount,
  onSelectAll,
  stickyHeader = true,
}: TableHeaderProps) {
  const { isDark } = useAdminTheme();

  const handleSort = useCallback(
    (field: string) => {
      if (!columns.find((col) => col.field === field)?.sortable) return;

      let newDirection: "asc" | "desc" = "asc";

      if (sortBy === field) {
        // If clicking the same column, toggle direction
        if (sortDir === "asc") {
          newDirection = "desc";
        } else if (sortDir === "desc") {
          // Third click removes sorting
          onSort("", "asc");
          return;
        }
      }

      onSort(field, newDirection);
    },
    [columns, sortBy, sortDir, onSort]
  );

  const getSortIcon = useCallback(
    (field: string) => {
      if (sortBy !== field) return null;

      return sortDir === "asc" ? (
        <ChevronUpIcon className="w-4 h-4 ml-1" />
      ) : (
        <ChevronDownIcon className="w-4 h-4 ml-1" />
      );
    },
    [sortBy, sortDir]
  );

  const headerClasses = `
    ${stickyHeader ? "sticky top-0 z-10" : ""}
    ${
      isDark
        ? "bg-[var(--admin-background)] border-b border-[var(--admin-border)]"
        : "bg-[var(--surface)] border-b border-[var(--border)]"
    }
  `;

  const cellClasses = `
    px-4 py-3 text-left text-sm font-medium
    ${isDark ? "text-[var(--admin-foreground)]" : "text-[var(--foreground)]"}
  `;

  const sortableCellClasses = `
    ${cellClasses}
    cursor-pointer hover:bg-opacity-50 transition-colors
    ${
      isDark ? "hover:bg-[var(--admin-surface)]" : "hover:bg-[var(--secondary)]"
    }
  `;

  const isAllSelected = totalCount > 0 && selectedCount === totalCount;
  const isIndeterminate = selectedCount > 0 && selectedCount < totalCount;

  return (
    <thead className={headerClasses}>
      <tr>
        {/* Selection Column */}
        {selectionEnabled && (
          <th className={cellClasses} style={{ width: "50px" }}>
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={(input) => {
                if (input) input.indeterminate = isIndeterminate;
              }}
              onChange={onSelectAll}
              className={`
                rounded border-2 focus:ring-2 focus:ring-offset-0
                ${
                  isDark
                    ? "border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-primary)] focus:ring-[var(--admin-primary)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--primary)] focus:ring-[var(--primary)]"
                }
              `}
              aria-label={`Select all rows (${selectedCount} of ${totalCount} selected)`}
            />
          </th>
        )}

        {/* Data Columns */}
        {columns.map((column) => {
          const isSortable = column.sortable !== false;
          const isCurrentSort = sortBy === column.field;

          return (
            <th
              key={column.field}
              className={isSortable ? sortableCellClasses : cellClasses}
              style={{
                width: column.width,
                minWidth: column.minWidth || 100,
                maxWidth: column.maxWidth,
                textAlign: column.align || "left",
              }}
              onClick={isSortable ? () => handleSort(column.field) : undefined}
              aria-sort={
                isCurrentSort
                  ? sortDir === "asc"
                    ? "ascending"
                    : "descending"
                  : isSortable
                    ? "none"
                    : undefined
              }
            >
              <div className="flex items-center justify-between">
                <span className={column.headerClassName}>
                  {column.headerName}
                </span>
                {isSortable && (
                  <div className="flex items-center">
                    {getSortIcon(column.field)}
                    {!isCurrentSort && (
                      <div className="w-4 h-4 ml-1 opacity-30">
                        <ChevronUpIcon className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </th>
          );
        })}

        {/* Actions Column Placeholder - will be added by parent if actions exist */}
      </tr>
    </thead>
  );
});

export default TableHeader;
