"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Cog,
  Save,
  AlertCircle,
  CheckCircle,
  Database,
  Shield,
  Mail,
  Activity,
  Lock,
  Globe,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface SystemConfigurationProps {
  onSettingsChange: () => void;
}

interface SystemConfiguration {
  application: {
    name: string;
    version: string;
    environment: string;
    debug: boolean;
  };
  database: {
    connectionString: string;
    maxConnections: number;
    timeout: number;
  };
  authentication: {
    jwtExpiry: string;
    refreshTokenExpiry: string;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
  };
  stripe: {
    publicKey: string;
    webhookEndpoint: string;
    defaultCurrency: string;
  };
  email: {
    provider: string;
    fromAddress: string;
    templatesEnabled: boolean;
  };
  telemetry: {
    enabled: boolean;
    retentionDays: number;
    batchSize: number;
  };
  security: {
    corsEnabled: boolean;
    rateLimitingEnabled: boolean;
    auditLoggingEnabled: boolean;
  };
}

export default function SystemConfiguration({
  onSettingsChange,
}: SystemConfigurationProps) {
  const [config, setConfig] = useState<SystemConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    fetchConfiguration();
  }, []);

  const fetchConfiguration = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/admin/settings/config", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch configuration");
      }

      const data = await response.json();
      setConfig(data.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load configuration"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (
    section: keyof SystemConfiguration,
    key: string,
    value: any
  ) => {
    if (!config) return;

    setConfig((prev) => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [key]: value,
      },
    }));
    onSettingsChange();
  };

  const handleNestedConfigChange = (
    section: keyof SystemConfiguration,
    nestedKey: string,
    key: string,
    value: any
  ) => {
    if (!config) return;

    setConfig((prev) => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [nestedKey]: {
          ...(prev![section] as any)[nestedKey],
          [key]: value,
        },
      },
    }));
    onSettingsChange();
  };

  const handleSave = async () => {
    if (!config) return;

    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/admin/settings/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ config }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save configuration");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save configuration"
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleSensitiveVisibility = (field: string) => {
    setShowSensitive((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-20 bg-slate-200 dark:bg-slate-700 rounded"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400">
          Failed to load system configuration
        </p>
        <Button onClick={fetchConfiguration} className="mt-4">
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
          System configuration saved successfully!
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

      {/* Application Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-2">
          <Cog className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Application Settings
          </h3>
        </div>

        <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Application Name
              </label>
              <Input
                value={config.application.name}
                onChange={(e) =>
                  handleConfigChange("application", "name", e.target.value)
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Version
              </label>
              <Input
                value={config.application.version}
                onChange={(e) =>
                  handleConfigChange("application", "version", e.target.value)
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Environment
              </label>
              <select
                value={config.application.environment}
                onChange={(e) =>
                  handleConfigChange(
                    "application",
                    "environment",
                    e.target.value
                  )
                }
                className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="development">Development</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="debugMode"
                checked={config.application.debug}
                onChange={(e) =>
                  handleConfigChange("application", "debug", e.target.checked)
                }
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="debugMode"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Debug Mode
              </label>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Database Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-green-600 dark:text-green-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Database Settings
          </h3>
        </div>

        <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Connection String
            </label>
            <div className="relative">
              <Input
                type={showSensitive.connectionString ? "text" : "password"}
                value={config.database.connectionString}
                onChange={(e) =>
                  handleConfigChange(
                    "database",
                    "connectionString",
                    e.target.value
                  )
                }
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => toggleSensitiveVisibility("connectionString")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showSensitive.connectionString ? (
                  <EyeOff className="h-4 w-4 text-slate-400" />
                ) : (
                  <Eye className="h-4 w-4 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Max Connections
              </label>
              <Input
                type="number"
                min="1"
                value={config.database.maxConnections}
                onChange={(e) =>
                  handleConfigChange(
                    "database",
                    "maxConnections",
                    parseInt(e.target.value)
                  )
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Timeout (ms)
              </label>
              <Input
                type="number"
                min="1000"
                value={config.database.timeout}
                onChange={(e) =>
                  handleConfigChange(
                    "database",
                    "timeout",
                    parseInt(e.target.value)
                  )
                }
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Authentication Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Authentication Settings
          </h3>
        </div>

        <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                JWT Expiry
              </label>
              <Input
                value={config.authentication.jwtExpiry}
                onChange={(e) =>
                  handleConfigChange(
                    "authentication",
                    "jwtExpiry",
                    e.target.value
                  )
                }
                placeholder="1h"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Refresh Token Expiry
              </label>
              <Input
                value={config.authentication.refreshTokenExpiry}
                onChange={(e) =>
                  handleConfigChange(
                    "authentication",
                    "refreshTokenExpiry",
                    e.target.value
                  )
                }
                placeholder="7d"
              />
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-slate-900 dark:text-white mb-4">
              Password Policy
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Minimum Length
                </label>
                <Input
                  type="number"
                  min="6"
                  value={config.authentication.passwordPolicy.minLength}
                  onChange={(e) =>
                    handleNestedConfigChange(
                      "authentication",
                      "passwordPolicy",
                      "minLength",
                      parseInt(e.target.value)
                    )
                  }
                />
              </div>

              <div className="space-y-3">
                {[
                  { key: "requireUppercase", label: "Require Uppercase" },
                  { key: "requireLowercase", label: "Require Lowercase" },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={key}
                      checked={
                        (config.authentication.passwordPolicy as any)[key]
                      }
                      onChange={(e) =>
                        handleNestedConfigChange(
                          "authentication",
                          "passwordPolicy",
                          key,
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label
                      htmlFor={key}
                      className="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      {label}
                    </label>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {[
                  { key: "requireNumbers", label: "Require Numbers" },
                  {
                    key: "requireSpecialChars",
                    label: "Require Special Chars",
                  },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={key}
                      checked={
                        (config.authentication.passwordPolicy as any)[key]
                      }
                      onChange={(e) =>
                        handleNestedConfigChange(
                          "authentication",
                          "passwordPolicy",
                          key,
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label
                      htmlFor={key}
                      className="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      {label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Additional Settings Sections */}
      {/* Telemetry Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Telemetry Settings
          </h3>
        </div>

        <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="telemetryEnabled"
                checked={config.telemetry.enabled}
                onChange={(e) =>
                  handleConfigChange("telemetry", "enabled", e.target.checked)
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

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Retention Days
              </label>
              <Input
                type="number"
                min="1"
                value={config.telemetry.retentionDays}
                onChange={(e) =>
                  handleConfigChange(
                    "telemetry",
                    "retentionDays",
                    parseInt(e.target.value)
                  )
                }
                disabled={!config.telemetry.enabled}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Batch Size
              </label>
              <Input
                type="number"
                min="1"
                value={config.telemetry.batchSize}
                onChange={(e) =>
                  handleConfigChange(
                    "telemetry",
                    "batchSize",
                    parseInt(e.target.value)
                  )
                }
                disabled={!config.telemetry.enabled}
              />
            </div>
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
          {saving ? "Saving..." : "Save Configuration"}
        </Button>
      </motion.div>
    </div>
  );
}
