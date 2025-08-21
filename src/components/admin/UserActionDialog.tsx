"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Shield,
  Key,
  Settings,
  UserX,
  Power,
  PowerOff,
  AlertTriangle,
  CheckCircle,
  Mail,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import apiClient from "@/lib/axios";
import { ConfirmDialog } from "./ConfirmDialog";

interface UserActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  action: string | null;
  onActionComplete?: () => void;
}

interface User {
  _id: string;
  email: string;
  name?: string;
  role?: string;
}

export default function UserActionDialog({
  isOpen,
  onClose,
  userId,
  action,
  onActionComplete,
}: UserActionDialogProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (isOpen && userId) {
      fetchUser();
    }
  }, [isOpen, userId]);

  useEffect(() => {
    if (action) {
      setFormData({});
    }
  }, [action]);

  const fetchUser = async () => {
    if (!userId) return;

    try {
      const { data } = await apiClient.get(`/api/admin/users/${userId}`);
      if (data.success) {
        setUser(data.data.user);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const handleAction = async (actionType: string, payload: any) => {
    if (!userId) return;

    setLoading(true);

    try {
      let endpoint = `/api/admin/users/${userId}`;
      let method: "post" | "put" = "post";
      let body: any = { action: actionType, ...payload };

      // Special handling for role changes
      if (actionType === "change_role") {
        endpoint = `/api/admin/users/${userId}/role`;
        method = "put";
        body = {
          role: payload.role,
          confirmation: payload.confirmation,
        };
      }

      const { data } = await (method === "post"
        ? apiClient.post(endpoint, body)
        : apiClient.put(endpoint, body));
      if (!data.success) {
        throw new Error(data.message || `Failed to ${actionType}`);
      }

      onActionComplete?.();
      onClose();
    } catch (error) {
      console.error(`Error performing ${actionType}:`, error);
      alert(
        `Failed to ${actionType}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmedAction = () => {
    if (!confirmAction) return;

    switch (confirmAction) {
      case "change_role":
        handleAction("change_role", {
          role: formData.newRole,
          confirmation: formData.emailConfirmation,
        });
        break;
      case "reset_password":
        handleAction("reset_password", {
          newPassword: formData.newPassword,
          sendEmail: formData.sendEmail,
        });
        break;
      case "deactivate_account":
        handleAction("deactivate_account", {
          reason: formData.reason,
        });
        break;
      case "activate_account":
        handleAction("activate_account", {
          activateLicenses: formData.activateLicenses,
          activateDevices: formData.activateDevices,
        });
        break;
      case "delete_account":
        handleAction("delete_account", {
          confirmation: formData.emailConfirmation,
          deleteData: formData.deleteData,
          reason: formData.reason,
        });
        break;
    }

    setConfirmDialogOpen(false);
    setConfirmAction(null);
  };

  const renderRoleChangeForm = () => {
    if (!user) return null;

    const currentRole = user.role || "user";
    const newRole = currentRole === "admin" ? "user" : "admin";

    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Role Change Warning</span>
          </div>
          <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
            You are about to change this user's role from{" "}
            <strong>{currentRole}</strong> to <strong>{newRole}</strong>. This
            action requires email confirmation and will take effect immediately.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Current Role: <span className="text-blue-600">{currentRole}</span>
          </label>
          <label className="block text-sm font-medium mb-2">
            New Role: <span className="text-purple-600">{newRole}</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Email Confirmation *
          </label>
          <Input
            type="email"
            placeholder="Type the user's email to confirm"
            value={formData.emailConfirmation || ""}
            onChange={(e) =>
              setFormData({ ...formData, emailConfirmation: e.target.value })
            }
          />
          <p className="text-xs text-slate-500 mt-1">Type: {user.email}</p>
        </div>

        <Button
          onClick={() => {
            setFormData({ ...formData, newRole });
            setConfirmAction("change_role");
            setConfirmDialogOpen(true);
          }}
          disabled={formData.emailConfirmation !== user.email}
          className="w-full"
        >
          <Shield className="h-4 w-4 mr-2" />
          Change Role to {newRole}
        </Button>
      </div>
    );
  };

  const renderPasswordResetForm = () => {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <Key className="h-5 w-5" />
            <span className="font-medium">Password Reset</span>
          </div>
          <p className="mt-2 text-sm text-blue-700 dark:text-blue-300">
            Generate a new password for this user. The user will need to use
            this new password to log in.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            New Password *
          </label>
          <Input
            type="password"
            placeholder="Enter new password (min 8 characters)"
            value={formData.newPassword || ""}
            onChange={(e) =>
              setFormData({ ...formData, newPassword: e.target.value })
            }
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="sendEmail"
            checked={formData.sendEmail || false}
            onChange={(e) =>
              setFormData({ ...formData, sendEmail: e.target.checked })
            }
          />
          <label htmlFor="sendEmail" className="text-sm">
            Send email notification to user
          </label>
        </div>

        <Button
          onClick={() => {
            setConfirmAction("reset_password");
            setConfirmDialogOpen(true);
          }}
          disabled={!formData.newPassword || formData.newPassword.length < 8}
          className="w-full"
        >
          <Key className="h-4 w-4 mr-2" />
          Reset Password
        </Button>
      </div>
    );
  };

  const renderAccountActionsForm = () => {
    return (
      <div className="space-y-4">
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
          <h3 className="font-medium mb-3">Account Management Actions</h3>
          <div className="space-y-3">
            {/* Deactivate Account */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
              <h4 className="font-medium text-orange-600 dark:text-orange-400 mb-2">
                Deactivate Account
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                Temporarily disable the user account and all associated
                licenses/devices.
              </p>
              <div className="mb-3">
                <Input
                  placeholder="Reason for deactivation"
                  value={formData.deactivateReason || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      deactivateReason: e.target.value,
                    })
                  }
                />
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  setFormData({
                    ...formData,
                    reason: formData.deactivateReason,
                  });
                  setConfirmAction("deactivate_account");
                  setConfirmDialogOpen(true);
                }}
                disabled={!formData.deactivateReason}
                className="w-full"
              >
                <PowerOff className="h-4 w-4 mr-2" />
                Deactivate Account
              </Button>
            </div>

            {/* Activate Account */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
              <h4 className="font-medium text-green-600 dark:text-green-400 mb-2">
                Activate Account
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                Reactivate the user account and optionally restore
                licenses/devices.
              </p>
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="activateLicenses"
                    checked={formData.activateLicenses || false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        activateLicenses: e.target.checked,
                      })
                    }
                  />
                  <label htmlFor="activateLicenses" className="text-sm">
                    Reactivate licenses
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="activateDevices"
                    checked={formData.activateDevices || false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        activateDevices: e.target.checked,
                      })
                    }
                  />
                  <label htmlFor="activateDevices" className="text-sm">
                    Reactivate devices
                  </label>
                </div>
              </div>
              <Button
                variant="primary"
                onClick={() => {
                  setConfirmAction("activate_account");
                  setConfirmDialogOpen(true);
                }}
                className="w-full"
              >
                <Power className="h-4 w-4 mr-2" />
                Activate Account
              </Button>
            </div>

            {/* Delete Account */}
            <div className="border border-red-200 dark:border-red-800 rounded-lg p-3 bg-red-50 dark:bg-red-900/20">
              <h4 className="font-medium text-red-600 dark:text-red-400 mb-2">
                Delete Account (Dangerous)
              </h4>
              <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                Permanently delete the user account. This action cannot be
                undone.
              </p>
              <div className="space-y-3">
                <Input
                  placeholder="Reason for deletion"
                  value={formData.deleteReason || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, deleteReason: e.target.value })
                  }
                />
                <Input
                  placeholder="Type user's email to confirm"
                  value={formData.deleteEmailConfirmation || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      deleteEmailConfirmation: e.target.value,
                    })
                  }
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="deleteData"
                    checked={formData.deleteData || false}
                    onChange={(e) =>
                      setFormData({ ...formData, deleteData: e.target.checked })
                    }
                  />
                  <label htmlFor="deleteData" className="text-sm">
                    Also delete associated licenses and devices
                  </label>
                </div>
              </div>
              <Button
                variant="error"
                onClick={() => {
                  setFormData({
                    ...formData,
                    reason: formData.deleteReason,
                    emailConfirmation: formData.deleteEmailConfirmation,
                  });
                  setConfirmAction("delete_account");
                  setConfirmDialogOpen(true);
                }}
                disabled={
                  !formData.deleteReason ||
                  !formData.deleteEmailConfirmation ||
                  formData.deleteEmailConfirmation !== user?.email
                }
                className="w-full mt-3"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getActionTitle = () => {
    switch (action) {
      case "change_role":
        return "Change User Role";
      case "reset_password":
        return "Reset Password";
      case "account_actions":
        return "Account Management";
      default:
        return "User Action";
    }
  };

  const getConfirmationMessage = () => {
    switch (confirmAction) {
      case "change_role":
        return `Are you sure you want to change this user's role to ${formData.newRole}?`;
      case "reset_password":
        return "Are you sure you want to reset this user's password?";
      case "deactivate_account":
        return "Are you sure you want to deactivate this user's account?";
      case "activate_account":
        return "Are you sure you want to activate this user's account?";
      case "delete_account":
        return "Are you sure you want to permanently delete this user's account? This action cannot be undone.";
      default:
        return "Are you sure you want to perform this action?";
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {getActionTitle()}
                  </h2>
                  <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-6">
                  {user && (
                    <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="text-sm">
                        <span className="text-slate-600 dark:text-slate-400">
                          User:
                        </span>
                        <span className="ml-2 font-medium">{user.email}</span>
                      </div>
                      {user.name && (
                        <div className="text-sm">
                          <span className="text-slate-600 dark:text-slate-400">
                            Name:
                          </span>
                          <span className="ml-2">{user.name}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {action === "change_role" && renderRoleChangeForm()}
                  {action === "reset_password" && renderPasswordResetForm()}
                  {action === "account_actions" && renderAccountActionsForm()}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleConfirmedAction}
        title="Confirm Action"
        message={getConfirmationMessage()}
        variant={confirmAction === "delete_account" ? "danger" : "warning"}
        confirmText={confirmAction === "delete_account" ? "Delete" : "Confirm"}
        requireTypedConfirmation={confirmAction === "delete_account"}
        expectedText={confirmAction === "delete_account" ? "DELETE" : undefined}
      />
    </>
  );
}
