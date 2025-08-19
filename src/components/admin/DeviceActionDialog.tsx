"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle,
  X,
  Loader2,
  Edit3,
  Power,
  PowerOff,
  Unlink,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

interface DeviceActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: any) => Promise<void>;
  action: "rename" | "activate" | "deactivate" | "unbind";
  deviceName: string;
  currentStatus?: string;
}

export function DeviceActionDialog({
  isOpen,
  onClose,
  onConfirm,
  action,
  deviceName,
  currentStatus,
}: DeviceActionDialogProps) {
  const [reason, setReason] = useState("");
  const [newName, setNewName] = useState(deviceName);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      let payload: any = { action };

      switch (action) {
        case "rename":
          if (!newName.trim() || newName.trim() === deviceName) {
            alert("Please enter a different name");
            return;
          }
          payload.newName = newName.trim();
          break;
        case "deactivate":
        case "unbind":
          if (!reason.trim()) {
            alert("Reason is required for this action");
            return;
          }
          payload.reason = reason.trim();
          break;
      }

      await onConfirm(payload);
      onClose();
      setReason("");
      setNewName(deviceName);
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
      setNewName(deviceName);
    }
  };

  const getActionConfig = () => {
    switch (action) {
      case "rename":
        return {
          title: "Rename Device",
          description: `Change the name of device "${deviceName}".`,
          icon: Edit3,
          iconColor: "text-blue-600",
          confirmText: "Rename Device",
          confirmVariant: "primary" as const,
          requiresReason: false,
          requiresInput: true,
        };
      case "activate":
        return {
          title: "Activate Device",
          description: `Are you sure you want to activate device "${deviceName}"? This will enable the device for use.`,
          icon: Power,
          iconColor: "text-green-600",
          confirmText: "Activate Device",
          confirmVariant: "primary" as const,
          requiresReason: false,
          requiresInput: false,
        };
      case "deactivate":
        return {
          title: "Deactivate Device",
          description: `Are you sure you want to deactivate device "${deviceName}"? This will disable the device.`,
          icon: PowerOff,
          iconColor: "text-red-600",
          confirmText: "Deactivate Device",
          confirmVariant: "error" as const,
          requiresReason: true,
          requiresInput: false,
        };
      case "unbind":
        return {
          title: "Unbind Device",
          description: `Are you sure you want to unbind device "${deviceName}"? This will permanently remove the device from the system and cannot be undone.`,
          icon: Unlink,
          iconColor: "text-red-600",
          confirmText: "Unbind Device",
          confirmVariant: "error" as const,
          requiresReason: true,
          requiresInput: false,
          destructive: true,
        };
      default:
        return {
          title: "Confirm Action",
          description: `Perform action on device "${deviceName}".`,
          icon: AlertTriangle,
          iconColor: "text-gray-600",
          confirmText: "Confirm",
          confirmVariant: "primary" as const,
          requiresReason: false,
          requiresInput: false,
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

                {config.destructive && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <span className="text-red-800 dark:text-red-200 font-medium text-sm">
                        Warning: This action cannot be undone
                      </span>
                    </div>
                  </div>
                )}

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

                {config.requiresInput && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      New Device Name
                    </label>
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Enter new device name..."
                      disabled={loading}
                      className="w-full"
                    />
                  </div>
                )}

                {config.requiresReason && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Reason (Required)
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

                {!config.requiresReason && !config.requiresInput && (
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
                    loading ||
                    (config.requiresReason && !reason.trim()) ||
                    (config.requiresInput &&
                      (!newName.trim() || newName.trim() === deviceName))
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

export default DeviceActionDialog;
