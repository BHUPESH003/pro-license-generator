"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Activity,
  Database,
  Clock,
  CheckCircle,
  AlertCircle,
  Globe,
  Monitor,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import apiClient from "@/lib/axios";
import { JsonViewer } from "@/components/admin/JsonViewer";

interface AuditDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  auditId: string | null;
}

interface AuditLog {
  _id: string;
  actorUserId: string;
  actorEmail: string;
  actorName?: string;
  action: string;
  entityType: string;
  entityId?: string;
  payload?: Record<string, any>;
  success: boolean;
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export default function AuditDetailDrawer({
  isOpen,
  onClose,
  auditId,
}: AuditDetailDrawerProps) {
  const [auditLog, setAuditLog] = useState<AuditLog | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPayload, setShowPayload] = useState(false);

  useEffect(() => {
    if (isOpen && auditId) {
      fetchAuditLog();
    } else {
      setAuditLog(null);
      setError(null);
      setShowPayload(false);
    }
  }, [isOpen, auditId]);

  const fetchAuditLog = async () => {
    if (!auditId) return;

    setLoading(true);
    setError(null);

    try {
      const { data } = await apiClient.get(`/api/admin/audit/${auditId}`);
      setAuditLog(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load audit log");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatAction = (action: string) => {
    const parts = action.split("_");
    const entityType = parts[0];
    const operation = parts.slice(1).join(" ");
    return { entityType, operation };
  };

  const formatUserAgent = (userAgent: string) => {
    // Simple user agent parsing
    const parts = userAgent.split(" ");
    const browser = parts.find(
      (part) =>
        part.includes("Chrome") ||
        part.includes("Firefox") ||
        part.includes("Safari") ||
        part.includes("Edge")
    );
    const os = parts.find(
      (part) =>
        part.includes("Windows") ||
        part.includes("Mac") ||
        part.includes("Linux") ||
        part.includes("Android") ||
        part.includes("iOS")
    );

    return { browser: browser || "Unknown", os: os || "Unknown" };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="ml-auto w-full max-w-2xl bg-white dark:bg-slate-800 shadow-2xl flex flex-col h-full"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Audit Log Details
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {auditId
                      ? `ID: ${auditId.substring(0, 8)}...`
                      : "Loading..."}
                  </p>
                </div>
              </div>
              <Button variant="secondary" onClick={onClose} className="p-2">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading && (
                <div className="space-y-4">
                  <div className="animate-pulse">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-16 bg-slate-200 dark:bg-slate-700 rounded mb-4"
                      ></div>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
                  <AlertCircle className="h-5 w-5" />
                  {error}
                </div>
              )}

              {auditLog && (
                <div className="space-y-6">
                  {/* Status */}
                  <div className="flex items-center gap-3">
                    {auditLog.success ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-red-500" />
                    )}
                    <div>
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                        {auditLog.success
                          ? "Successful Operation"
                          : "Failed Operation"}
                      </h3>
                      {auditLog.errorMessage && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                          {auditLog.errorMessage}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Basic Information */}
                  <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4 space-y-4">
                    <h4 className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Operation Details
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          Action
                        </label>
                        <div className="mt-1">
                          {(() => {
                            const { entityType, operation } = formatAction(
                              auditLog.action
                            );
                            return (
                              <div>
                                <div className="font-medium text-slate-900 dark:text-white">
                                  {operation}
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                  on {entityType}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          Entity Type
                        </label>
                        <div className="mt-1">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                            {auditLog.entityType}
                          </span>
                        </div>
                      </div>

                      {auditLog.entityId && (
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Entity ID
                          </label>
                          <div className="mt-1 flex items-center gap-2">
                            <code className="text-sm font-mono text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                              {auditLog.entityId}
                            </code>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(auditLog.entityId!)
                              }
                              className="p-1"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actor Information */}
                  <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4 space-y-4">
                    <h4 className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Actor Information
                    </h4>

                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                        {auditLog.actorEmail?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">
                          {auditLog.actorEmail || "Unknown"}
                        </div>
                        {auditLog.actorName && (
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {auditLog.actorName}
                          </div>
                        )}
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          ID: {auditLog.actorUserId}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4 space-y-4">
                    <h4 className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Timestamp
                    </h4>

                    <div>
                      <div className="text-lg font-medium text-slate-900 dark:text-white">
                        {new Date(auditLog.createdAt).toLocaleString()}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(auditLog.createdAt).toISOString()}
                      </div>
                    </div>
                  </div>

                  {/* Network Information */}
                  {(auditLog.ipAddress || auditLog.userAgent) && (
                    <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4 space-y-4">
                      <h4 className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Network Information
                      </h4>

                      <div className="space-y-3">
                        {auditLog.ipAddress && (
                          <div>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                              IP Address
                            </label>
                            <div className="mt-1 flex items-center gap-2">
                              <code className="text-sm font-mono text-slate-900 dark:text-white">
                                {auditLog.ipAddress}
                              </code>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() =>
                                  copyToClipboard(auditLog.ipAddress!)
                                }
                                className="p-1"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}

                        {auditLog.userAgent && (
                          <div>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                              User Agent
                            </label>
                            <div className="mt-1">
                              {(() => {
                                const { browser, os } = formatUserAgent(
                                  auditLog.userAgent
                                );
                                return (
                                  <div className="flex items-center gap-2">
                                    <Monitor className="h-4 w-4 text-slate-400" />
                                    <span className="text-sm text-slate-900 dark:text-white">
                                      {browser} on {os}
                                    </span>
                                  </div>
                                );
                              })()}
                              <details className="mt-2">
                                <summary className="text-xs text-slate-500 dark:text-slate-400 cursor-pointer">
                                  Full User Agent
                                </summary>
                                <code className="text-xs text-slate-600 dark:text-slate-400 block mt-1 p-2 bg-slate-100 dark:bg-slate-700 rounded">
                                  {auditLog.userAgent}
                                </code>
                              </details>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Payload */}
                  {auditLog.payload && (
                    <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          Payload Data
                        </h4>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setShowPayload(!showPayload)}
                          className="flex items-center gap-2"
                        >
                          {showPayload ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                          {showPayload ? "Hide" : "Show"}
                        </Button>
                      </div>

                      {showPayload && (
                        <div className="border border-slate-200 dark:border-slate-600 rounded">
                          <JsonViewer data={auditLog.payload} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
