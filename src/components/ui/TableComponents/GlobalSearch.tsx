"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAdminTheme } from "../../admin/AdminTheme";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface GlobalSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  disabled?: boolean;
  className?: string;
  onClear?: () => void;
  showResultCount?: boolean;
  resultCount?: number;
  totalCount?: number;
}

export const GlobalSearch = React.memo(function GlobalSearch({
  value,
  onChange,
  placeholder = "Search across all columns...",
  debounceMs = 300,
  disabled = false,
  className = "",
  onClear,
  showResultCount = false,
  resultCount = 0,
  totalCount = 0,
}: GlobalSearchProps) {
  const { isDark } = useAdminTheme();
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  // Sync local value with prop value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced onChange
  useEffect(() => {
    if (localValue === value) return;

    const timer = setTimeout(() => {
      onChange(localValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, value, onChange, debounceMs]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalValue(e.target.value);
    },
    []
  );

  const handleClear = useCallback(() => {
    setLocalValue("");
    onChange("");
    if (onClear) {
      onClear();
    }
  }, [onChange, onClear]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        handleClear();
        (e.target as HTMLInputElement).blur();
      }
    },
    [handleClear]
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const inputClasses = `
    w-full pl-10 pr-10 py-2.5 text-sm border rounded-lg
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-0
    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
    ${isFocused ? "shadow-md" : "shadow-sm"}
    ${
      isDark
        ? `
          border-[var(--admin-border)] 
          bg-[var(--admin-surface)] 
          text-[var(--admin-foreground)]
          placeholder-[var(--admin-muted)]
          focus:ring-[var(--admin-primary)]
          focus:border-[var(--admin-primary)]
        `
        : `
          border-[var(--border)] 
          bg-[var(--surface)] 
          text-[var(--foreground)]
          placeholder-[var(--muted-foreground)]
          focus:ring-[var(--primary)]
          focus:border-[var(--primary)]
        `
    }
  `;

  const containerClasses = `
    relative flex-1 max-w-md
    ${className}
  `;

  const iconClasses = `
    absolute top-1/2 transform -translate-y-1/2 
    w-4 h-4 transition-colors duration-200
    ${
      isDark
        ? isFocused
          ? "text-[var(--admin-primary)]"
          : "text-[var(--admin-muted)]"
        : isFocused
        ? "text-[var(--primary)]"
        : "text-[var(--muted-foreground)]"
    }
  `;

  return (
    <div className={containerClasses}>
      <div className="relative">
        {/* Search Icon */}
        <MagnifyingGlassIcon className={`${iconClasses} left-3`} />

        {/* Search Input */}
        <input
          type="text"
          value={localValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClasses}
          aria-label="Global search"
          aria-describedby={showResultCount ? "search-results" : undefined}
        />

        {/* Clear Button */}
        {localValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className={`
              absolute right-3 top-1/2 transform -translate-y-1/2
              p-1 rounded-full transition-all duration-200
              hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-0
              ${
                isDark
                  ? `
                    text-[var(--admin-muted)] 
                    hover:text-[var(--admin-foreground)]
                    hover:bg-[var(--admin-surface)]
                    focus:ring-[var(--admin-primary)]
                  `
                  : `
                    text-[var(--muted-foreground)] 
                    hover:text-[var(--foreground)]
                    hover:bg-[var(--secondary)]
                    focus:ring-[var(--primary)]
                  `
              }
            `}
            aria-label="Clear search"
            title="Clear search (Esc)"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Results Count */}
      {showResultCount && localValue && (
        <div
          id="search-results"
          className={`
            mt-2 text-xs
            ${
              isDark
                ? "text-[var(--admin-muted)]"
                : "text-[var(--muted-foreground)]"
            }
          `}
        >
          {resultCount === 0 ? (
            <span>No results found for "{localValue}"</span>
          ) : (
            <span>
              Found {resultCount.toLocaleString()} of{" "}
              {totalCount.toLocaleString()} results
              {resultCount !== totalCount && ` for "${localValue}"`}
            </span>
          )}
        </div>
      )}
    </div>
  );
});

export default GlobalSearch;
