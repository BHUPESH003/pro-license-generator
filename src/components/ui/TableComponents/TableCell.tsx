"use client";

import React from "react";
import { DataTableColumn } from "../CustomDataTable.types";
import { useAdminTheme } from "../../admin/AdminTheme";
import { highlightSearchTerm } from "./utils/searchHighlight";

interface TableCellProps {
  column: DataTableColumn;
  row: any;
  value: any;
  searchTerm?: string;
  highlightSearch?: boolean;
}

export const TableCell = React.memo(function TableCell({
  column,
  row,
  value,
  searchTerm = "",
  highlightSearch = false,
}: TableCellProps) {
  const { isDark } = useAdminTheme();

  const isRenderable = (node: any): boolean => {
    return (
      node === null ||
      node === undefined ||
      typeof node === "string" ||
      typeof node === "number" ||
      React.isValidElement(node)
    );
  };

  // Format the value if formatter is provided
  const formattedValue = column.valueFormatter
    ? column.valueFormatter(value)
    : value;

  // Render custom cell content if renderer is provided
  let cellContent: React.ReactNode = formattedValue;
  if (column.cellRenderer) {
    const safeValue = value === undefined ? null : value;
    try {
      // First, try modern signature: (value, row)
      const attempt1 = (column.cellRenderer as any)(safeValue, row);
      if (isRenderable(attempt1)) {
        cellContent = attempt1;
      } else {
        // Fallback to AG Grid-like signature: (params)
        const attempt2 = (column.cellRenderer as any)({
          value: safeValue,
          row,
          data: row,
        });
        cellContent = isRenderable(attempt2) ? attempt2 : formattedValue;
      }
    } catch (e) {
      try {
        const attempt2 = (column.cellRenderer as any)({
          value: safeValue,
          row,
          data: row,
        });
        cellContent = isRenderable(attempt2) ? attempt2 : formattedValue;
      } catch (err) {
        console.error("Cell renderer error for column:", column.field, err);
        cellContent = formattedValue;
      }
    }
  }

  // Apply search highlighting if enabled and no custom renderer
  if (
    highlightSearch &&
    searchTerm &&
    !column.cellRenderer &&
    typeof cellContent === "string"
  ) {
    const highlightClassName = isDark
      ? "bg-yellow-800 text-yellow-100 px-1 rounded"
      : "bg-yellow-200 text-yellow-900 px-1 rounded";
    cellContent = highlightSearchTerm(
      cellContent,
      searchTerm,
      highlightClassName
    );
  }

  // Get cell classes
  const getCellClassName = () => {
    const baseClasses = `
      px-4 py-3 text-sm
      ${isDark ? "text-[var(--admin-foreground)]" : "text-[var(--foreground)]"}
    `;

    if (typeof column.cellClassName === "function") {
      return `${baseClasses} ${column.cellClassName(value, row)}`;
    } else if (typeof column.cellClassName === "string") {
      return `${baseClasses} ${column.cellClassName}`;
    }

    return baseClasses;
  };

  return (
    <td
      className={getCellClassName()}
      style={{
        width: column.width,
        minWidth: column.minWidth || 100,
        maxWidth: column.maxWidth,
        textAlign: column.align || "left",
      }}
    >
      <div
        className="truncate"
        title={typeof cellContent === "string" ? cellContent : undefined}
      >
        {cellContent}
      </div>
    </td>
  );
});

export default TableCell;
