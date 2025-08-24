"use client";

import React from "react";
import { useAdminTheme } from "../../admin/AdminTheme";

export function LoadingOverlay() {
  const { isDark } = useAdminTheme();

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center z-20 ${
        isDark
          ? "bg-[var(--admin-surface)] bg-opacity-80"
          : "bg-[var(--surface)] bg-opacity-80"
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div
          className={`w-8 h-8 border-4 border-solid rounded-full animate-spin ${
            isDark
              ? "border-[var(--admin-border)] border-t-[var(--admin-primary)]"
              : "border-[var(--border)] border-t-[var(--primary)]"
          }`}
        />

        {/* Loading Text */}
        <div
          className={`text-sm font-medium ${
            isDark
              ? "text-[var(--admin-foreground)]"
              : "text-[var(--foreground)]"
          }`}
        >
          Loading...
        </div>
      </div>
    </div>
  );
}

export default LoadingOverlay;
