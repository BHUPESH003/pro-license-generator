"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Save,
  AlertCircle,
  CheckCircle,
  Trash2,
  Calendar,
  Database,
  Archive,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import apiClient from "@/lib/axios";

interface AuditRetentionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRetentionUpdate: () => void;
}

interface RetentionPolicy {
  enabled: boolean;
  retentionDays: number;
  archiveBeforeDelete: boolean;
  archiveLocation?: string;
}

interface CleanupResult {
  dryRun: boolean;
  recordsToDelete?: number;
  deletedCount?: number;
  cutoffDate: string;
}

export default function AuditRetentionDialog({
  isOpen,
  onClose,
  onRetentionUpdate,
}: AuditRetentionDialogProps) {
  const [policy, setPolicy] = useState<RetentionPolicy>({
    enabled: true,
    retentionDays: 365,
    archiveBeforeDelete: false,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [cleanupResult, setCleanupResult] = useState<CleanupResult | null>(
    null
  );

  useEffect(() => {
    if (isOpen) {
      fetchRetentionPolicy();
    } else {
      setError(null);
      setSuccess(null);
      setCleanupResult(null);
    }
  }, [isOpen]);

  const fetchRetentionPolicy = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await apiClient.get("/api/admin/audit/retention");
      setPolicy(data.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load retention policy"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePolicyChange = (key: keyof RetentionPolicy, value: any) => {
    setPolicy((prev) => ({ ...prev, [key]: value }));
  };

  const handleSavePolicy = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await apiClient.put("/api/admin/audit/retention", { policy });

      setSuccess("Retention policy updated successfully");
      onRetentionUpdate();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save retention policy"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCleanupPreview = async () => {
    setCleaning(true);
    setError(null);
    setCleanupResult(null);

    try {
      const { data } = await apiClient.delete(
        `/api/admin/audit/retention`,
        { params: { dryRun: true, retentionDays: policy.retentionDays } }
      );
      setCleanupResult(data.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to preview cleanup"
      );
    } finally {
      setCleaning(false);
    }
  };

  const handleCleanupExecute = async () => {
    setCleaning(true);
    setError(null);

    try {
      const { data } = await apiClient.delete(
        `/api/admin/audit/retention`,
        { params: { retentionDays: policy.retentionDays } }
      );
      setCleanupResult(data.data);
      setSuccess(
        `Successfully deleted ${data.data.deletedCount} audit records`
      );
      onRetentionUpdate();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to execute cleanup"
      );
    } finally {
      setCleaning(false);
    }
  };

  const handleClose = () => {
    if (!saving && !cleaning) {
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
            className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <Archive className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Audit Log Retention
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Configure retention policy and cleanup old audit logs
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={handleClose}
                disabled={saving || cleaning}
                className="p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Success/Error Messages */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200"
                >
                  <CheckCircle className="h-5 w-5" />
                  {success}
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

              {loading ? (
                <div className="space-y-4">
                  <div className="animate-pulse">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-16 bg-slate-200 dark:bg-slate-700 rounded mb-4"
                      ></div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {/* Retention Policy */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Retention Policy
                      </h4>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4 space-y-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="retentionEnabled"
                          checked={policy.enabled}
                          onChange={(e) =>
                            handlePolicyChange("enabled", e.target.checked)
                          }
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label
                          htmlFor="retentionEnabled"
                          className="text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                          Enable automatic retention policy
                        </label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Retention Period (days)
                          </label>
                          <Input
                            type="number"
                            min="30"
                            value={policy.retentionDays}
                            onChange={(e) =>
                              handlePolicyChange(
                                "retentionDays",
                                parseInt(e.target.value)
                              )
                            }
                            disabled={!policy.enabled}
                          />
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Minimum 30 days required
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="archiveBeforeDelete"
                            checked={policy.archiveBeforeDelete}
                            onChange={(e) =>
                              handlePolicyChange(
                                "archiveBeforeDelete",
                                e.target.checked
                              )
                            }
                            disabled={!policy.enabled}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <label
                            htmlFor="archiveBeforeDelete"
                            className="text-sm font-medium text-slate-700 dark:text-slate-300"
                          >
                            Archive before deletion
                          </label>
                        </div>
                      </div>

                      {policy.archiveBeforeDelete && (
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Archive Location
                          </label>
                          <Input
                            value={policy.archiveLocation || ""}
                            onChange={(e) =>
                              handlePolicyChange(
                                "archiveLocation",
                                e.target.value
                              )
                            }
                            placeholder="s3://bucket/audit-logs/"
                            disabled={!policy.enabled}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Manual Cleanup */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Manual Cleanup
                      </h4>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4 space-y-4">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Manually clean up audit logs older than the specified
                        retention period. This action cannot be undone.
                      </p>

                      <div className="flex items-center gap-3">
                        <Button
                          variant="secondary"
                          onClick={handleCleanupPreview}
                          disabled={cleaning}
                          className="flex items-center gap-2"
                        >
                          <Play className="h-4 w-4" />
                          {cleaning ? "Checking..." : "Preview Cleanup"}
                        </Button>

                        {cleanupResult && (
                          <Button
                            variant="error"
                            onClick={handleCleanupExecute}
                            disabled={
                              cleaning || cleanupResult.dryRun === false
                            }
                            className="flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            {cleaning ? "Deleting..." : "Execute Cleanup"}
                          </Button>
                        )}
                      </div>

                      {cleanupResult && (
                        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                          <div className="flex items-start gap-3">
                            <Database className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                            <div>
                              <h5 className="font-medium text-yellow-900 dark:text-yellow-100">
                                Cleanup Results
                              </h5>
                              <div className="text-sm text-yellow-700 dark:text-yellow-200 mt-1 space-y-1">
                                <p>
                                  <strong>Cutoff Date:</strong>{" "}
                                  {new Date(
                                    cleanupResult.cutoffDate
                                  ).toLocaleString()}
                                </p>
                                {cleanupResult.dryRun ? (
                                  <p>
                                    <strong>Records to delete:</strong>{" "}
                                    {cleanupResult.recordsToDelete}
                                  </p>
                                ) : (
                                  <p>
                                    <strong>Records deleted:</strong>{" "}
                                    {cleanupResult.deletedCount}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
              <Button
                variant="secondary"
                onClick={handleClose}
                disabled={saving || cleaning}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSavePolicy}
                disabled={saving || cleaning || loading}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Policy"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
