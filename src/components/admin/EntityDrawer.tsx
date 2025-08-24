import React, { useEffect } from "react";
import { X } from "lucide-react";
import Button from "../ui/Button";

interface EntityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant: "primary" | "secondary" | "error" | "accent";
    loading?: boolean;
  }>;
  width?: "sm" | "md" | "lg" | "xl";
}

export const EntityDrawer: React.FC<EntityDrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  actions = [],
  width = "md",
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const getWidthClass = () => {
    switch (width) {
      case "sm":
        return "w-80";
      case "md":
        return "w-96";
      case "lg":
        return "w-[32rem]";
      case "xl":
        return "w-[40rem]";
      default:
        return "w-96";
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`
          fixed right-0 top-0 z-50 h-full bg-[var(--surface)] border-l border-[var(--border)] shadow-xl
          transform transition-transform duration-300 ease-in-out
          ${getWidthClass()}
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          max-w-full
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold text-[var(--foreground)] truncate">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {/* Actions Footer */}
        {actions.length > 0 && (
          <div className="border-t border-[var(--border)] p-6">
            <div className="flex justify-end gap-3">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant}
                  onClick={action.onClick}
                  disabled={action.loading}
                >
                  {action.loading ? "Loading..." : action.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default EntityDrawer;
