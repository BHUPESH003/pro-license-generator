import React from "react";

/**
 * Highlights search terms in text content
 */
export function highlightSearchTerm(
  text: string,
  searchTerm: string,
  highlightClassName: string = "bg-yellow-200 dark:bg-yellow-800 px-1 rounded"
): React.ReactNode {
  if (!searchTerm || !text) {
    return text;
  }

  // Escape special regex characters in search term
  const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Create case-insensitive regex with global flag
  const regex = new RegExp(`(${escapedSearchTerm})`, "gi");

  // Split text by search term while preserving the matches
  const parts = text.split(regex);

  return parts.map((part, index) => {
    // Check if this part matches the search term (case-insensitive)
    if (part.toLowerCase() === searchTerm.toLowerCase()) {
      return (
        <mark
          key={index}
          className={highlightClassName}
          title={`Highlighted: ${searchTerm}`}
        >
          {part}
        </mark>
      );
    }
    return part;
  });
}

/**
 * Checks if a value contains the search term
 */
export function matchesSearchTerm(value: any, searchTerm: string): boolean {
  if (!searchTerm) return true;
  if (value == null) return false;

  const stringValue = String(value).toLowerCase();
  const lowerSearchTerm = searchTerm.toLowerCase();

  return stringValue.includes(lowerSearchTerm);
}

/**
 * Searches across multiple fields of an object
 */
export function searchInObject(
  obj: Record<string, any>,
  searchTerm: string,
  searchableFields?: string[]
): boolean {
  if (!searchTerm) return true;
  if (!obj) return false;

  const fieldsToSearch = searchableFields || Object.keys(obj);

  return fieldsToSearch.some((field) => {
    const value = obj[field];
    return matchesSearchTerm(value, searchTerm);
  });
}

/**
 * Gets search match score for ranking results
 */
export function getSearchScore(
  obj: Record<string, any>,
  searchTerm: string,
  searchableFields?: string[]
): number {
  if (!searchTerm) return 0;
  if (!obj) return 0;

  const fieldsToSearch = searchableFields || Object.keys(obj);
  let score = 0;

  fieldsToSearch.forEach((field) => {
    const value = String(obj[field] || "").toLowerCase();
    const lowerSearchTerm = searchTerm.toLowerCase();

    if (value === lowerSearchTerm) {
      // Exact match gets highest score
      score += 100;
    } else if (value.startsWith(lowerSearchTerm)) {
      // Starts with search term gets high score
      score += 50;
    } else if (value.includes(lowerSearchTerm)) {
      // Contains search term gets medium score
      score += 25;
    }
  });

  return score;
}

/**
 * Filters and sorts search results
 */
export function filterAndSortSearchResults<T extends Record<string, any>>(
  data: T[],
  searchTerm: string,
  searchableFields?: string[]
): T[] {
  if (!searchTerm) return data;

  return data
    .filter((item) => searchInObject(item, searchTerm, searchableFields))
    .sort((a, b) => {
      const scoreA = getSearchScore(a, searchTerm, searchableFields);
      const scoreB = getSearchScore(b, searchTerm, searchableFields);
      return scoreB - scoreA; // Higher score first
    });
}

/**
 * Debounce utility for search input
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;

  const debounced = ((...args: any[]) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T & { cancel: () => void };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}

/**
 * Hook for managing search state with debouncing
 */
export function useSearchState(
  initialValue: string = "",
  debounceMs: number = 300,
  onChange?: (value: string) => void
) {
  const [localValue, setLocalValue] = React.useState(initialValue);
  const [debouncedValue, setDebouncedValue] = React.useState(initialValue);

  // Update local value when initial value changes
  React.useEffect(() => {
    setLocalValue(initialValue);
    setDebouncedValue(initialValue);
  }, [initialValue]);

  // Debounce the value changes
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(localValue);
      if (onChange) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onChange]);

  const clearSearch = React.useCallback(() => {
    setLocalValue("");
    setDebouncedValue("");
    if (onChange) {
      onChange("");
    }
  }, [onChange]);

  return {
    localValue,
    debouncedValue,
    setLocalValue,
    clearSearch,
    isSearching: localValue !== debouncedValue,
  };
}
