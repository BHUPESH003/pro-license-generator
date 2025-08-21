"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, X, Loader2 } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

interface LicenseActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void>;
  action: "activate" | "deactivate" | "update";
  licenseKey: string;
  currentStatus?: string;
}

export function LicenseActionDialog({
  isOpen,
  onClose,
  onConfirm,
  action,
  licenseKey,
  currentStatus,
}: LicenseActionDialogProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(reason || undefined);
      onClose();
      setReason("");
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setReason("");
    }
  };

  const getActionConfig = () => {
    switch (action) {
      case "activate":
        return {
          title: "Activate License",
          description: `Are you sure you want to activate license ${licenseKey}? This will enable the license and all associated devices.`,
          icon: CheckCircle,
          iconColor: "text-green-600",
          confirmText: "Activate License",
          confirmVariant: "primary" as const,
          requiresReason: false,
        };
      case "deactivate":
        return {
          title: "Deactivate License",
          description: `Are you sure you want to deactivate license ${licenseKey}? This will disable the license and all associated devices.`,
          icon: AlertTriangle,
          iconColor: "text-red-600",
          confirmText: "Deactivate License",
          confirmVariant: "error" as const,
          requiresReason: true,
        };
      case "update":
        return {
          title: "Update License",
          description: `Update license ${licenseKey} details.`,
          icon: CheckCircle,
          iconColor: "text-blue-600",
          confirmText: "Update License",
          confirmVariant: "primary" as const,
          requiresReason: false,
        };
      default:
        return {
          title: "Confirm Action",
          description: `Perform action on license ${licenseKey}.`,
          icon: AlertTriangle,
          iconColor: "text-gray-600",
          confirmText: "Confirm",
          confirmVariant: "primary" as const,
          requiresReason: false,
        };
    }
  };

  const config = getActionConfig();
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-700`}
                  >
                    <Icon className={`h-5 w-5 ${config.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {config.title}
                  </h3>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleClose}
                  disabled={loading}
                  className="p-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <p className="text-slate-600 dark:text-slate-400">
                  {config.description}
                </p>

                {currentStatus && (
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
                    <div className="text-sm">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        Current Status:
                      </span>
                      <span
                        className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                          currentStatus === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        }`}
                      >
                        {currentStatus.charAt(0).toUpperCase() +
                          currentStatus.slice(1)}
                      </span>
                    </div>
                  </div>
                )}

                {config.requiresReason && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Reason{" "}
                      {config.requiresReason ? "(Required)" : "(Optional)"}
                    </label>
                    <Input
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Enter reason for this action..."
                      disabled={loading}
                      className="w-full"
                    />
                  </div>
                )}

                {!config.requiresReason && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Reason (Optional)
                    </label>
                    <Input
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Enter reason for this action..."
                      disabled={loading}
                      className="w-full"
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
                <Button
                  variant="secondary"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant={config.confirmVariant}
                  onClick={handleConfirm}
                  disabled={
                    loading || (config.requiresReason && !reason.trim())
                  }
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                  {config.confirmText}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default LicenseActionDialog;
