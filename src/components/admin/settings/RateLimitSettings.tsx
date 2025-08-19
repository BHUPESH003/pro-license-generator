"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Save,
  AlertCircle,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  Globe,
  Clock,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import apiClient from "@/lib/axios";

interface RateLimitSettingsProps {
  onSettingsChange: () => void;
}

interface RateLimitRule {
  id: string;
  endpoint: string;
  method: string;
  requests: number;
  window: string;
  enabled: boolean;
  description?: string;
}

interface RateLimitConfig {
  global: {
    enabled: boolean;
    defaultRequests: number;
    defaultWindow: string;
  };
  rules: RateLimitRule[];
}

export default function RateLimitSettings({
  onSettingsChange,
}: RateLimitSettingsProps) {
  const [config, setConfig] = useState<RateLimitConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [editingRule, setEditingRule] = useState<RateLimitRule | null>(null);

  useEffect(() => {
    fetchRateLimits();
  }, []);

  const fetchRateLimits = async () => {
    try {
      const { data } = await apiClient.get("/api/admin/settings/rate-limits");
      setConfig(data.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load rate limits"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGlobalChange = (key: string, value: any) => {
    if (!config) return;

    setConfig((prev) => ({
      ...prev!,
      global: {
        ...prev!.global,
        [key]: value,
      },
    }));
    onSettingsChange();
  };

  const handleRuleChange = (ruleId: string, key: string, value: any) => {
    if (!config) return;

    setConfig((prev) => ({
      ...prev!,
      rules: prev!.rules.map((rule) =>
        rule.id === ruleId ? { ...rule, [key]: value } : rule
      ),
    }));
    onSettingsChange();
  };

  const handleSave = async () => {
    if (!config) return;

    setSaving(true);
    setError(null);

    try {
      await apiClient.put("/api/admin/settings/rate-limits", { config });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save rate limits"
      );
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
            {[1, 2, 3].map((i) => (
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
          Failed to load rate limit configuration
        </p>
        <Button onClick={fetchRateLimits} className="mt-4">
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
          Rate limit configuration saved successfully!
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

      {/* Global Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Global Rate Limiting
          </h3>
        </div>

        <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="globalEnabled"
              checked={config.global.enabled}
              onChange={(e) => handleGlobalChange("enabled", e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="globalEnabled"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Enable Global Rate Limiting
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Default Requests
              </label>
              <Input
                type="number"
                min="1"
                value={config.global.defaultRequests}
                onChange={(e) =>
                  handleGlobalChange(
                    "defaultRequests",
                    parseInt(e.target.value)
                  )
                }
                disabled={!config.global.enabled}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Default Window
              </label>
              <select
                value={config.global.defaultWindow}
                onChange={(e) =>
                  handleGlobalChange("defaultWindow", e.target.value)
                }
                disabled={!config.global.enabled}
                className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1m">1 minute</option>
                <option value="5m">5 minutes</option>
                <option value="15m">15 minutes</option>
                <option value="1h">1 hour</option>
                <option value="1d">1 day</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Rate Limit Rules */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Endpoint Rate Limits
            </h3>
          </div>
        </div>

        <div className="space-y-4">
          {config.rules.map((rule, index) => (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                      {rule.method}
                    </span>
                    <code className="text-sm font-mono text-slate-600 dark:text-slate-400">
                      {rule.endpoint}
                    </code>
                  </div>
                  {rule.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {rule.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={(e) =>
                      handleRuleChange(rule.id, "enabled", e.target.checked)
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Enabled
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Activity className="h-4 w-4 inline mr-1" />
                    Requests
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={rule.requests}
                    onChange={(e) =>
                      handleRuleChange(
                        rule.id,
                        "requests",
                        parseInt(e.target.value)
                      )
                    }
                    disabled={!rule.enabled}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Time Window
                  </label>
                  <select
                    value={rule.window}
                    onChange={(e) =>
                      handleRuleChange(rule.id, "window", e.target.value)
                    }
                    disabled={!rule.enabled}
                    className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="1m">1 minute</option>
                    <option value="5m">5 minutes</option>
                    <option value="15m">15 minutes</option>
                    <option value="1h">1 hour</option>
                    <option value="1d">1 day</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700/30 rounded text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                  Limit: <strong>{rule.requests} requests</strong> per{" "}
                  <strong>{rule.window}</strong>
                  {!rule.enabled && (
                    <span className="ml-2 text-orange-600 dark:text-orange-400">
                      (Disabled)
                    </span>
                  )}
                </span>
              </div>
            </motion.div>
          ))}
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
          {saving ? "Saving..." : "Save Rate Limits"}
        </Button>
      </motion.div>
    </div>
  );
}
