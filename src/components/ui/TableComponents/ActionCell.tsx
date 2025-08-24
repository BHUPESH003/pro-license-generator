"use client";

import React, { useCallback } from "react";
import { ActionConfig } from "../CustomDataTable.types";
import { Button } from "../Button";
import { useAdminTheme } from "../../admin/AdminTheme";

interface ActionCellProps<T = any> {
  row: T;
  actions: ActionConfig<T>[];
}

export const ActionCell = React.memo(function ActionCell<T = any>({
  row,
  actions,
}: ActionCellProps<T>) {
  const { isDark } = useAdminTheme();

  const handleActionClick = useCallback(
    (e: React.MouseEvent, action: ActionConfig<T>) => {
      // Prevent event bubbling to row click
      e.stopPropagation();
      e.preventDefault();

      // Check if action is disabled
      if (action.disabled && action.disabled(row)) {
        return;
      }

      // Execute action
      action.onClick(row);
    },
    [row]
  );

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Prevent mousedown bubbling as additional safety
    e.stopPropagation();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, action: ActionConfig<T>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();

        if (action.disabled && action.disabled(row)) {
          return;
        }

        action.onClick(row);
      }
    },
    [row]
  );

  // Filter actions based on visibility and permissions
  const visibleActions = actions.filter((action) => {
    // Check if action should be hidden
    if (action.hidden && action.hidden(row)) {
      return false;
    }

    // Legacy condition support (deprecated)
    if (action.condition && !action.condition(row)) {
      return false;
    }

    return true;
  });

  if (visibleActions.length === 0) {
    return (
      <td className="px-4 py-3" style={{ width: "120px" }} role="cell">
        {/* Empty cell for consistent spacing */}
      </td>
    );
  }

  // Calculate dynamic width based on number of actions
  const cellWidth = Math.max(120, visibleActions.length * 80);

  return (
    <td
      className="px-4 py-3"
      style={{ width: `${cellWidth}px` }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={handleMouseDown}
      role="cell"
    >
      <div className="flex gap-2 justify-end items-center">
        {visibleActions.map((action, index) => {
          const isDisabled = action.disabled ? action.disabled(row) : false;

          return (
            <Button
              key={`${action.label}-${index}`}
              variant={action.variant || "secondary"}
              size="sm"
              disabled={isDisabled}
              onClick={(e) => handleActionClick(e, action)}
              onMouseDown={handleMouseDown}
              onKeyDown={(e) => handleKeyDown(e, action)}
              className={`
                text-xs px-3 py-1.5 min-w-[60px] transition-all duration-200
                ${isDisabled ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}
                ${isDark ? "focus:ring-[var(--admin-primary)]" : "focus:ring-[var(--primary)]"}
              `}
              title={isDisabled ? `${action.label} is disabled` : action.label}
              aria-label={`${action.label}`}
            >
              {action.icon && (
                <span className="mr-1.5 flex items-center">{action.icon}</span>
              )}
              <span className="truncate">{action.label}</span>
            </Button>
          );
        })}
      </div>
    </td>
  );
});

export default ActionCell;
