"use client";

import React from "react";
import { FilterConfig } from "../CustomDataTable.types";
import { TextFilter } from "./Filters/TextFilter";
import { SelectFilter } from "./Filters/SelectFilter";
import { DateFilter } from "./Filters/DateFilter";
import { FilterActions } from "./Filters/FilterActions";
import { useAdminTheme } from "../../admin/AdminTheme";

interface TableFiltersProps {
  filters: FilterConfig[];
  values: Record<string, any>;
  onFiltersChange: (filters: Record<string, any>) => void;
  onClearFilters: () => void;
  exportEnabled: boolean;
  onExport: () => void;
  loading: boolean;
}

export const TableFilters = React.memo(function TableFilters({
  filters,
  values,
  onFiltersChange,
  onClearFilters,
  exportEnabled,
  onExport,
  loading,
}: TableFiltersProps) {
  const { isDark } = useAdminTheme();

  const handleFilterChange = React.useCallback(
    (field: string, value: any) => {
      const newFilters = { ...values, [field]: value };
      onFiltersChange(newFilters);
    },
    [values, onFiltersChange]
  );

  if (filters.length === 0) {
    return null;
  }

  return (
    <div
      className={`mb-4 p-4 rounded ${
        isDark
          ? "bg-[var(--admin-surface)] border border-[var(--admin-border)]"
          : "bg-[var(--surface)] border border-[var(--border)]"
      }`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-end">
        {filters.map((filter, index) => (
          <div key={`${filter.field}-${index}`} className="flex flex-col min-w-0">
            <label
              className={`text-sm font-medium mb-1 ${
                isDark
                  ? "text-[var(--admin-foreground)]"
                  : "text-[var(--foreground)]"
              }`}
            >
              {filter.label}
            </label>

            {filter.type === "text" && (
              <TextFilter
                filter={filter}
                value={values[filter.field] ?? ""}
                onChange={(value) => handleFilterChange(filter.field, value)}
              />
            )}

            {filter.type === "select" && (
              <SelectFilter
                filter={filter}
                value={values[filter.field] ?? ""}
                onChange={(value) => handleFilterChange(filter.field, value)}
              />
            )}

            {(filter.type === "date" || filter.type === "dateRange") && (
              <DateFilter
                filter={filter}
                value={values[filter.field] ?? ""}
                onChange={(value) => handleFilterChange(filter.field, value)}
              />
            )}

            {filter.type === "number" && (
              <input
                type="number"
                placeholder={filter.placeholder}
                value={values[filter.field] ?? ""}
                onChange={(e) =>
                  handleFilterChange(filter.field, e.target.value)
                }
                className={`px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                  filter.width || "w-full"
                } ${
                  isDark
                    ? "border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-foreground)] focus:ring-[var(--admin-primary)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] focus:ring-[var(--primary)]"
                } ${filter.className || ""}`}
              />
            )}
          </div>
        ))}

        <FilterActions
          onClearFilters={onClearFilters}
          exportEnabled={exportEnabled}
          onExport={onExport}
          loading={loading}
        />
      </div>
    </div>
  );
});

export default TableFilters;
