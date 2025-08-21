"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Save,
  AlertCircle,
  CheckCircle,
  User,
  Mail,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import apiClient from "@/lib/axios";

interface AdminUser {
  _id: string;
  email: string;
  name?: string;
  role: "admin";
  lastSeenAt?: string;
  createdAt: string;
}

interface AdminUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  admin?: AdminUser | null;
}

interface FormData {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}

export default function AdminUserDialog({
  isOpen,
  onClose,
  admin,
}: AdminUserDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isEditing = !!admin;

  useEffect(() => {
    if (isOpen) {
      if (admin) {
        setFormData({
          email: admin.email,
          name: admin.name || "",
          password: "",
          confirmPassword: "",
        });
      } else {
        setFormData({
          email: "",
          name: "",
          password: "",
          confirmPassword: "",
        });
      }
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, admin]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.email.trim()) {
      return "Email is required";
    }

    if (!formData.email.includes("@")) {
      return "Please enter a valid email address";
    }

    if (!isEditing && !formData.password) {
      return "Password is required for new admin users";
    }

    if (formData.password && formData.password.length < 8) {
      return "Password must be at least 8 characters long";
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      return "Passwords do not match";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = isEditing
        ? `/api/admin/settings/admins/${admin!._id}`
        : "/api/admin/settings/admins";

      const body: any = {
        email: formData.email.trim(),
        name: formData.name.trim() || undefined,
      };

      if (formData.password) {
        body.password = formData.password;
      }

      if (isEditing) {
        await apiClient.put(url, body);
      } else {
        await apiClient.post(url, body);
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save admin user"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {isEditing ? "Edit Admin User" : "Create Admin User"}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {isEditing
                      ? "Update admin user details"
                      : "Add a new administrator"}
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={handleClose}
                disabled={loading}
                className="p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Success Message */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200"
                >
                  <CheckCircle className="h-5 w-5" />
                  Admin user {isEditing ? "updated" : "created"} successfully!
                </motion.div>
              )}

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200"
                >
                  <AlertCircle className="h-5 w-5" />
                  {error}
                </motion.div>
              )}

              {/* Form Fields */}
              <div className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Mail className="h-4 w-4 inline mr-2" />
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="admin@example.com"
                    disabled={loading}
                    required
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <User className="h-4 w-4 inline mr-2" />
                    Full Name (Optional)
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="John Doe"
                    disabled={loading}
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Lock className="h-4 w-4 inline mr-2" />
                    Password {isEditing && "(Leave blank to keep current)"}
                  </label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    placeholder={
                      isEditing ? "Enter new password" : "Enter password"
                    }
                    disabled={loading}
                    required={!isEditing}
                  />
                </div>

                {/* Confirm Password */}
                {formData.password && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      <Lock className="h-4 w-4 inline mr-2" />
                      Confirm Password
                    </label>
                    <Input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      placeholder="Confirm password"
                      disabled={loading}
                      required
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {loading
                    ? "Saving..."
                    : isEditing
                    ? "Update Admin"
                    : "Create Admin"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
