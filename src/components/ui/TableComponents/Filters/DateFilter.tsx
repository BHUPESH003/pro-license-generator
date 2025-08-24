"use client";

import React, { useCallback } from "react";
import { FilterConfig } from "../../CustomDataTable.types";
import { Input } from "../../Input";

interface DateFilterProps {
  filter: FilterConfig;
  value: string;
  onChange: (value: string) => void;
}

export function DateFilter({ filter, value, onChange }: DateFilterProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      // Validate if validator is provided
      if (filter.validator && !filter.validator(newValue)) {
        return;
      }

      onChange(newValue);
    },
    [filter.validator, onChange]
  );

  if (filter.type === "dateRange") {
    // For date range, we expect value to be in format "startDate,endDate"
    const [startDate, endDate] = value ? value.split(",") : ["", ""];

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newStartDate = e.target.value;
      const newValue = `${newStartDate},${endDate}`;

      if (filter.validator && !filter.validator(newValue)) {
        return;
      }

      onChange(newValue);
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newEndDate = e.target.value;
      const newValue = `${startDate},${newEndDate}`;

      if (filter.validator && !filter.validator(newValue)) {
        return;
      }

      onChange(newValue);
    };

    return (
      <div className="flex gap-2">
        <Input
          type="date"
          value={startDate}
          onChange={handleStartDateChange}
          className={`${filter.width || "w-36"} ${filter.className || ""}`}
          placeholder="Start date"
        />
        <Input
          type="date"
          value={endDate}
          onChange={handleEndDateChange}
          className={`${filter.width || "w-36"} ${filter.className || ""}`}
          placeholder="End date"
        />
      </div>
    );
  }

  return (
    <Input
      type="date"
      value={value}
      onChange={handleChange}
      className={`${filter.width || "w-48"} ${filter.className || ""}`}
    />
  );
}

export default DateFilter;
