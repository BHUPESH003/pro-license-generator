"use client";

import React from "react";
import { useAdminTheme } from "../../admin/AdminTheme";
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

interface EmptyStateProps {
  message: string;
  description?: string;
  type?: "empty" | "error" | "info";
  action?: React.ReactNode;
}

export function EmptyState({
  message,
  description,
  type = "empty",
  action,
}: EmptyStateProps) {
  const { isDark } = useAdminTheme();

  const getIcon = () => {
    switch (type) {
      case "error":
        return <ExclamationTriangleIcon className="w-12 h-12 text-red-500" />;
      case "info":
        return <InformationCircleIcon className="w-12 h-12 text-blue-500" />;
      default:
        return (
          <div
            className={`w-12 h-12 rounded-full border-2 border-dashed flex items-center justify-center ${
              isDark ? "border-[var(--admin-border)]" : "border-[var(--border)]"
            }`}
          >
            <span
              className={`text-2xl ${
                isDark
                  ? "text-[var(--admin-muted)]"
                  : "text-[var(--muted-foreground)]"
              }`}
            >
              📄
            </span>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="mb-4">{getIcon()}</div>

      <h3
        className={`text-lg font-medium mb-2 ${
          isDark ? "text-[var(--admin-foreground)]" : "text-[var(--foreground)]"
        }`}
      >
        {message}
      </h3>

      {description && (
        <p
          className={`text-sm text-center mb-4 max-w-md ${
            isDark
              ? "text-[var(--admin-muted)]"
              : "text-[var(--muted-foreground)]"
          }`}
        >
          {description}
        </p>
      )}

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default EmptyState;
