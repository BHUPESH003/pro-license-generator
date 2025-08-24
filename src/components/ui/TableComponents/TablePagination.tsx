"use client";

import React, { useCallback } from "react";
import { Button } from "../Button";
import { useAdminTheme } from "../../admin/AdminTheme";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface TablePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number, pageSize?: number) => void;
  loading: boolean;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export const TablePagination = React.memo(function TablePagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  loading,
}: TablePaginationProps) {
  const { isDark } = useAdminTheme();

  const handlePreviousPage = useCallback(() => {
    if (page > 1) {
      onPageChange(page - 1);
    }
  }, [page, onPageChange]);

  const handleNextPage = useCallback(() => {
    if (page < totalPages) {
      onPageChange(page + 1);
    }
  }, [page, totalPages, onPageChange]);

  const handlePageSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newPageSize = parseInt(e.target.value);
      onPageChange(1, newPageSize); // Reset to first page when changing page size
    },
    [onPageChange]
  );

  const handlePageInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newPage = parseInt(e.target.value);
      if (newPage >= 1 && newPage <= totalPages) {
        onPageChange(newPage);
      }
    },
    [totalPages, onPageChange]
  );

  const startRecord = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRecord = Math.min(page * pageSize, total);

  return (
    <div className="mt-4 flex items-center justify-between flex-wrap gap-4 sm:flex-nowrap">
      {/* Records Info */}
      <div className="flex items-center gap-4">
        <div
          className={`text-sm ${
            isDark
              ? "text-[var(--admin-muted)]"
              : "text-[var(--muted-foreground)]"
          }`}
        >
          {loading
            ? "Loading..."
            : total === 0
              ? "No records"
              : `Showing ${startRecord} to ${endRecord} of ${total} records`}
        </div>

        {/* Page Size Selector */}
        <div className="flex items-center gap-2">
          <label
            className={`text-sm ${
              isDark
                ? "text-[var(--admin-foreground)]"
                : "text-[var(--foreground)]"
            }`}
          >
            Show:
          </label>
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            disabled={loading}
            className={`px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 ${
              isDark
                ? "border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-foreground)] focus:ring-[var(--admin-primary)]"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] focus:ring-[var(--primary)]"
            }`}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={handlePreviousPage}
          disabled={page <= 1 || loading}
          className="flex items-center gap-1"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Previous
        </Button>

        {/* Page Info and Direct Page Input */}
        <div className="flex items-center gap-2">
          <span
            className={`text-sm ${
              isDark
                ? "text-[var(--admin-foreground)]"
                : "text-[var(--foreground)]"
            }`}
          >
            Page
          </span>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={page}
            onChange={handlePageInputChange}
            disabled={loading || totalPages <= 1}
            className={`w-16 px-2 py-1 border rounded text-sm text-center focus:outline-none focus:ring-2 ${
              isDark
                ? "border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-foreground)] focus:ring-[var(--admin-primary)]"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] focus:ring-[var(--primary)]"
            }`}
          />
          <span
            className={`text-sm ${
              isDark
                ? "text-[var(--admin-foreground)]"
                : "text-[var(--foreground)]"
            }`}
          >
            of {totalPages}
          </span>
        </div>

        {/* Next Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={handleNextPage}
          disabled={page >= totalPages || loading}
          className="flex items-center gap-1"
        >
          Next
          <ChevronRightIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
});

export default TablePagination;
