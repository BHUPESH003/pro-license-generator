import React, { useState } from "react";
import { AlertTriangle, Info, AlertCircle, X } from "lucide-react";
import Button from "../ui/Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  requireTypedConfirmation?: boolean;
  expectedText?: string;
  variant: "danger" | "warning" | "info";
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  requireTypedConfirmation = false,
  expectedText = "DELETE",
  variant,
}) => {
  const [typedText, setTypedText] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    if (requireTypedConfirmation && typedText !== expectedText) {
      return;
    }

    setIsConfirming(true);
    try {
      await onConfirm();
      handleClose();
    } catch (error) {
      console.error("Confirmation action failed:", error);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleClose = () => {
    setTypedText("");
    setIsConfirming(false);
    onClose();
  };

  const isConfirmDisabled =
    isConfirming || (requireTypedConfirmation && typedText !== expectedText);

  const getIcon = () => {
    switch (variant) {
      case "danger":
        return <AlertTriangle className="w-6 h-6 text-red-500" />;
      case "warning":
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      case "info":
        return <Info className="w-6 h-6 text-blue-500" />;
    }
  };

  const getButtonVariant = () => {
    switch (variant) {
      case "danger":
        return "error" as const;
      case "warning":
        return "accent" as const;
      case "info":
        return "primary" as const;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            {getIcon()}
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              {title}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            disabled={isConfirming}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-[var(--muted-foreground)] mb-4">{message}</p>

          {requireTypedConfirmation && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Type{" "}
                <span className="font-mono bg-[var(--card)] px-1 rounded">
                  {expectedText}
                </span>{" "}
                to confirm:
              </label>
              <input
                type="text"
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                placeholder={expectedText}
                disabled={isConfirming}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-[var(--border)]">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isConfirming}
          >
            Cancel
          </Button>
          <Button
            variant={getButtonVariant()}
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
          >
            {isConfirming ? "Processing..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
