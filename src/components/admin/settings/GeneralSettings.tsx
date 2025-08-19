"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, AlertCircle, CheckCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import apiClient from "@/lib/axios";

interface GeneralSettingsProps {
  onSettingsChange: () => void;
}

interface SystemSettings {
  general: {
    systemName: string;
    maintenanceMode: boolean;
    maxUsersPerLicense: number;
    defaultLicenseExpiry: number;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
    requirePasswordChange: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    webhookNotifications: boolean;
    adminAlerts: boolean;
  };
  features: {
    telemetryEnabled: boolean;
    auditLogging: boolean;
    exportEnabled: boolean;
  };
}

export default function GeneralSettings({
  onSettingsChange,
}: GeneralSettingsProps) {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await apiClient.get("/api/admin/settings");
      setSettings(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (
    section: keyof SystemSettings,
    key: string,
    value: any
  ) => {
    if (!settings) return;

    setSettings((prev) => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [key]: value,
      },
    }));
    onSettingsChange();
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    setError(null);

    try {
      await apiClient.put("/api/admin/settings", { settings });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-12 bg-slate-200 dark:bg-slate-700 rounded"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400">
          Failed to load settings
        </p>
        <Button onClick={fetchSettings} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Success/Error Messages */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200"
        >
          <CheckCircle className="h-5 w-5" />
          Settings saved successfully!
        </motion.div>
      )}

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

      {/* General Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            General Settings
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              System Name
            </label>
            <Input
              value={settings.general.systemName}
              onChange={(e) =>
                handleSettingChange("general", "systemName", e.target.value)
              }
              placeholder="Enter system name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Max Users Per License
            </label>
            <Input
              type="number"
              min="1"
              value={settings.general.maxUsersPerLicense}
              onChange={(e) =>
                handleSettingChange(
                  "general",
                  "maxUsersPerLicense",
                  parseInt(e.target.value)
                )
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Default License Expiry (days)
            </label>
            <Input
              type="number"
              min="1"
              value={settings.general.defaultLicenseExpiry}
              onChange={(e) =>
                handleSettingChange(
                  "general",
                  "defaultLicenseExpiry",
                  parseInt(e.target.value)
                )
              }
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="maintenanceMode"
              checked={settings.general.maintenanceMode}
              onChange={(e) =>
                handleSettingChange(
                  "general",
                  "maintenanceMode",
                  e.target.checked
                )
              }
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="maintenanceMode"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Maintenance Mode
            </label>
          </div>
        </div>
      </motion.div>

      {/* Security Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-red-600 dark:text-red-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Security Settings
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Session Timeout (minutes)
            </label>
            <Input
              type="number"
              min="5"
              value={settings.security.sessionTimeout}
              onChange={(e) =>
                handleSettingChange(
                  "security",
                  "sessionTimeout",
                  parseInt(e.target.value)
                )
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Max Login Attempts
            </label>
            <Input
              type="number"
              min="1"
              value={settings.security.maxLoginAttempts}
              onChange={(e) =>
                handleSettingChange(
                  "security",
                  "maxLoginAttempts",
                  parseInt(e.target.value)
                )
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Password Min Length
            </label>
            <Input
              type="number"
              min="6"
              value={settings.security.passwordMinLength}
              onChange={(e) =>
                handleSettingChange(
                  "security",
                  "passwordMinLength",
                  parseInt(e.target.value)
                )
              }
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="requirePasswordChange"
              checked={settings.security.requirePasswordChange}
              onChange={(e) =>
                handleSettingChange(
                  "security",
                  "requirePasswordChange",
                  e.target.checked
                )
              }
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="requirePasswordChange"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Require Password Change
            </label>
          </div>
        </div>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-green-600 dark:text-green-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Notification Settings
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="emailNotifications"
              checked={settings.notifications.emailNotifications}
              onChange={(e) =>
                handleSettingChange(
                  "notifications",
                  "emailNotifications",
                  e.target.checked
                )
              }
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="emailNotifications"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Email Notifications
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="webhookNotifications"
              checked={settings.notifications.webhookNotifications}
              onChange={(e) =>
                handleSettingChange(
                  "notifications",
                  "webhookNotifications",
                  e.target.checked
                )
              }
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="webhookNotifications"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Webhook Notifications
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="adminAlerts"
              checked={settings.notifications.adminAlerts}
              onChange={(e) =>
                handleSettingChange(
                  "notifications",
                  "adminAlerts",
                  e.target.checked
                )
              }
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="adminAlerts"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Admin Alerts
            </label>
          </div>
        </div>
      </motion.div>

      {/* Feature Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Feature Settings
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="telemetryEnabled"
              checked={settings.features.telemetryEnabled}
              onChange={(e) =>
                handleSettingChange(
                  "features",
                  "telemetryEnabled",
                  e.target.checked
                )
              }
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="telemetryEnabled"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Telemetry Enabled
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="auditLogging"
              checked={settings.features.auditLogging}
              onChange={(e) =>
                handleSettingChange(
                  "features",
                  "auditLogging",
                  e.target.checked
                )
              }
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="auditLogging"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Audit Logging
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="exportEnabled"
              checked={settings.features.exportEnabled}
              onChange={(e) =>
                handleSettingChange(
                  "features",
                  "exportEnabled",
                  e.target.checked
                )
              }
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="exportEnabled"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Export Enabled
            </label>
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex justify-end pt-6 border-t border-slate-200 dark:border-slate-700"
      >
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </motion.div>
    </div>
  );
}
