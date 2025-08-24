"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FilterConfig } from "../../CustomDataTable.types";
import { Input } from "../../Input";

interface TextFilterProps {
  filter: FilterConfig;
  value: string;
  onChange: (value: string) => void;
}

export function TextFilter({ filter, value, onChange }: TextFilterProps) {
  const [localValue, setLocalValue] = useState(value);
  const debounceMs = filter.debounceMs ?? 300;

  // Sync local value with prop value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced onChange
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, value, onChange, debounceMs]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      // Validate if validator is provided
      if (filter.validator && !filter.validator(newValue)) {
        return;
      }

      setLocalValue(newValue);
    },
    [filter.validator]
  );

  return (
    <Input
      type="text"
      placeholder={filter.placeholder}
      value={localValue}
      onChange={handleChange}
      className={`${filter.width || "w-48"} ${filter.className || ""}`}
    />
  );
}

export default TextFilter;
