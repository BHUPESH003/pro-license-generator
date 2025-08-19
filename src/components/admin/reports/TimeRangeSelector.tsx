"use client";

import React, { useState } from "react";
import { Calendar, Clock, ChevronDown } from "lucide-react";

export type TimeRange = "7d" | "30d" | "90d" | "1y" | "custom";

interface TimeRangeSelectorProps {
  selectedRange: TimeRange;
  onRangeChange: (
    range: TimeRange,
    customRange?: { from: string; to: string }
  ) => void;
  customDateRange?: { from: string; to: string };
  className?: string;
}

const TIME_RANGE_OPTIONS = [
  { value: "7d" as const, label: "Last 7 days" },
  { value: "30d" as const, label: "Last 30 days" },
  { value: "90d" as const, label: "Last 90 days" },
  { value: "1y" as const, label: "Last year" },
  { value: "custom" as const, label: "Custom range" },
];

export function TimeRangeSelector({
  selectedRange,
  onRangeChange,
  customDateRange,
  className = "",
}: TimeRangeSelectorProps) {
  const [showCustom, setShowCustom] = useState(selectedRange === "custom");
  const [tempCustomRange, setTempCustomRange] = useState(
    customDateRange || { from: "", to: "" }
  );

  const handleRangeSelect = (range: TimeRange) => {
    if (range === "custom") {
      setShowCustom(true);
    } else {
      setShowCustom(false);
      onRangeChange(range);
    }
  };

  const handleCustomRangeApply = () => {
    if (tempCustomRange.from && tempCustomRange.to) {
      onRangeChange("custom", tempCustomRange);
      setShowCustom(false);
    }
  };

  const handleCustomRangeCancel = () => {
    setTempCustomRange(customDateRange || { from: "", to: "" });
    setShowCustom(false);
    if (selectedRange !== "custom") {
      // Reset to previous selection if it wasn't custom
      onRangeChange(selectedRange);
    }
  };

  const getSelectedLabel = () => {
    const option = TIME_RANGE_OPTIONS.find(
      (opt) => opt.value === selectedRange
    );
    if (
      selectedRange === "custom" &&
      customDateRange?.from &&
      customDateRange?.to
    ) {
      const fromDate = new Date(customDateRange.from).toLocaleDateString();
      const toDate = new Date(customDateRange.to).toLocaleDateString();
      return `${fromDate} - ${toDate}`;
    }
    return option?.label || "Select range";
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        <span className="text-sm text-slate-600 dark:text-slate-400">
          Time Range:
        </span>
      </div>

      {/* Main Selector */}
      <div className="relative">
        <button
          className="flex items-center justify-between gap-2 px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors min-w-[180px]"
          onClick={() => setShowCustom(!showCustom)}
        >
          <span className="text-slate-900 dark:text-white">
            {getSelectedLabel()}
          </span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>

        {/* Dropdown */}
        {showCustom && (
          <div className="absolute top-full left-0 mt-1 w-full min-w-[300px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50">
            <div className="p-3 space-y-3">
              {/* Quick Options */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Quick Select
                </label>
                {TIME_RANGE_OPTIONS.filter((opt) => opt.value !== "custom").map(
                  (option) => (
                    <button
                      key={option.value}
                      onClick={() => handleRangeSelect(option.value)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        selectedRange === option.value
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                          : "hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {option.label}
                    </button>
                  )
                )}
              </div>

              {/* Custom Range */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3 space-y-3">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Custom Range
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                      From
                    </label>
                    <input
                      type="date"
                      value={tempCustomRange.from}
                      onChange={(e) =>
                        setTempCustomRange((prev) => ({
                          ...prev,
                          from: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                      To
                    </label>
                    <input
                      type="date"
                      value={tempCustomRange.to}
                      onChange={(e) =>
                        setTempCustomRange((prev) => ({
                          ...prev,
                          to: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleCustomRangeCancel}
                    className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCustomRangeApply}
                    disabled={!tempCustomRange.from || !tempCustomRange.to}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TimeRangeSelector;
