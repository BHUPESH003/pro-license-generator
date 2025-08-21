"use client";

import React from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

export interface TimeRange {
  label: string;
  value: number;
  key: string;
}

interface TimeRangeSelectorProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  className?: string;
}

export const TIME_RANGES: TimeRange[] = [
  { label: "7 Days", value: 7, key: "7d" },
  { label: "30 Days", value: 30, key: "30d" },
  { label: "90 Days", value: 90, key: "90d" },
];

export function TimeRangeSelector({
  selectedRange,
  onRangeChange,
  className = "",
}: TimeRangeSelectorProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
        <Clock className="h-4 w-4" />
        <span>Time Range:</span>
      </div>

      <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
        {TIME_RANGES.map((range) => (
          <motion.button
            key={range.key}
            onClick={() => onRangeChange(range)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
              selectedRange.key === range.key
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {range.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
