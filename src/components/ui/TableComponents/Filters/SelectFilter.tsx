"use client";

import React, { useCallback } from "react";
import { FilterConfig } from "../../CustomDataTable.types";
import { useAdminTheme } from "../../../admin/AdminTheme";

interface SelectFilterProps {
  filter: FilterConfig;
  value: string;
  onChange: (value: string) => void;
}

export function SelectFilter({ filter, value, onChange }: SelectFilterProps) {
  const { isDark } = useAdminTheme();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newValue = e.target.value;

      // Validate if validator is provided
      if (filter.validator && !filter.validator(newValue)) {
        return;
      }

      onChange(newValue);
    },
    [filter.validator, onChange]
  );

  return (
    <select
      value={value}
      onChange={handleChange}
      className={`px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
        filter.width || "w-48"
      } ${
        isDark
          ? "border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-foreground)] focus:ring-[var(--admin-primary)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] focus:ring-[var(--primary)]"
      } ${filter.className || ""}`}
    >
      <option value="">All</option>
      {filter.options?.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default SelectFilter;
