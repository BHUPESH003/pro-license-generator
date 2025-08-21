"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Smartphone,
  User,
  Key,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  Monitor,
  Loader2,
  Edit3,
  Power,
  PowerOff,
  Unlink,
  Calendar,
  BarChart3,
} from "lucide-react";
import { Button } from "../ui/Button";
import apiClient from "@/lib/axios";

interface DeviceDetail {
  _id: string;
  name: string;
  os: string;
  deviceGuid?: string;
  status: "active" | "inactive";
  lastActivity: Date;
  user: {
    _id: string;
    email: string;
    name?: string;
    phone?: string;
  };
  license: {
    _id: string;
    licenseKey: string;
    status: "active" | "inactive";
    plan: string;
    mode?: "subscription" | "payment";
    planType?: "monthly" | "quarterly" | "yearly";
    expiryDate: Date;
  };
  telemetryEvents: Array<{
    _id: string;
    eventType: string;
    occurredAt: Date;
    appVersion?: string;
    metadata?: Record<string, any>;
  }>;
  activityHistory: Array<{
    _id: string;
    type: string;
    description: string;
    timestamp: Date;
    actor?: {
      _id: string;
      email: string;
      name?: string;
    };
    metadata?: Record<string, any>;
  }>;
  statistics: {
    totalTelemetryEvents: number;
    uniqueEventTypes: number;
    lastTelemetryEvent?: Date;
    daysActive: number;
    averageEventsPerDay: number;
    topEventTypes: Array<{
      eventType: string;
      count: number;
    }>;
  };
}

interface DeviceDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  deviceId: string | null;
  onActionComplete?: () => void;
}

export function DeviceDetailDrawer({
  isOpen,
  onClose,
  deviceId,
  onActionComplete,
}: DeviceDetailDrawerProps) {
  const [device, setDevice] = useState<DeviceDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (isOpen && deviceId) {
      fetchDeviceDetail();
    }
  }, [isOpen, deviceId]);

  const fetchDeviceDetail = async () => {
    if (!deviceId) return;

    setLoading(true);
    setError(null);

    try {
      const { data } = await apiClient.get(`/api/admin/devices/${deviceId}`);
      if (!data.success) {
        throw new Error(data.message || "Failed to fetch device details");
      }

      setDevice(data.data);
    } catch (err) {
      console.error("Error fetching device details:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch device details"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (
    action: "activate" | "deactivate" | "rename" | "unbind",
    payload?: any
  ) => {
    if (!deviceId) return;

    setActionLoading(true);

    try {
      const { data } = await apiClient.post(
        `/api/admin/devices/${deviceId}/actions`,
        { action, ...payload }
      );
      if (!data.success) {
        throw new Error(data.message || "Failed to perform action");
      }

      // Refresh device details
      await fetchDeviceDetail();

      // Notify parent component
      if (onActionComplete) {
        onActionComplete();
      }
    } catch (err) {
      console.error("Error performing action:", err);
      setError(err instanceof Error ? err.message : "Failed to perform action");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "inactive":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "device_created":
      case "device_renamed":
        return <Smartphone className="h-4 w-4" />;
      case "device_activated":
      case "device_deactivated":
        return <Power className="h-4 w-4" />;
      case "admin_action":
        return <Settings className="h-4 w-4" />;
      case "telemetry_activity":
        return <Activity className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getEventTypeColor = (eventType: string) => {
    const colors: Record<string, string> = {
      scan: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      heartbeat:
        "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      update:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
      error: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
      warning:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
    };
    return (
      colors[eventType] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-4xl bg-white dark:bg-slate-800 shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Device Details
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {device?.name || "Loading..."}
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={onClose}
                className="p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                    <p className="text-slate-600 dark:text-slate-400">
                      Loading device details...
                    </p>
                  </div>
                </div>
              ) : error ? (
                <div className="p-6">
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      <span className="text-red-800 dark:text-red-200 font-medium">
                        Error
                      </span>
                    </div>
                    <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                      {error}
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={fetchDeviceDetail}
                      className="mt-3"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : device ? (
                <div className="p-6 space-y-6">
                  {/* Device Info */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Monitor className="h-5 w-5" />
                      Device Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          Status
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(device.status)}
                          <span
                            className={`text-sm font-medium ${
                              device.status === "active"
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {device.status.charAt(0).toUpperCase() +
                              device.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          Operating System
                        </label>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          {device.os}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          Device GUID
                        </label>
                        <p className="text-sm text-slate-900 dark:text-white mt-1 font-mono">
                          {device.deviceGuid || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          Last Activity
                        </label>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          {formatDate(device.lastActivity)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <User className="h-5 w-5" />
                      User Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          Email
                        </label>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          {device.user.email}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          Name
                        </label>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          {device.user.name || "N/A"}
                        </p>
                      </div>
                      {device.user.phone && (
                        <div>
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Phone
                          </label>
                          <p className="text-sm text-slate-900 dark:text-white mt-1">
                            {device.user.phone}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* License Info */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      License Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          License Key
                        </label>
                        <p className="text-sm text-slate-900 dark:text-white mt-1 font-mono">
                          {device.license.licenseKey}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          Status
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(device.license.status)}
                          <span
                            className={`text-sm font-medium ${
                              device.license.status === "active"
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {device.license.status.charAt(0).toUpperCase() +
                              device.license.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          Plan
                        </label>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          {device.license.plan}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          Expiry Date
                        </label>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          {formatDate(device.license.expiryDate)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Statistics
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {device.statistics.totalTelemetryEvents}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Total Events
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {device.statistics.uniqueEventTypes}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Event Types
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {device.statistics.daysActive}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Days Active
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {device.statistics.averageEventsPerDay}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Avg Events/Day
                        </p>
                      </div>
                    </div>

                    {/* Top Event Types */}
                    {device.statistics.topEventTypes.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Top Event Types
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {device.statistics.topEventTypes.map((eventType) => (
                            <span
                              key={eventType.eventType}
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(
                                eventType.eventType
                              )}`}
                            >
                              {eventType.eventType} ({eventType.count})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recent Telemetry Events */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Recent Telemetry Events ({device.telemetryEvents.length})
                    </h3>
                    {device.telemetryEvents.length > 0 ? (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {device.telemetryEvents.slice(0, 10).map((event) => (
                          <div
                            key={event._id}
                            className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(
                                  event.eventType
                                )}`}
                              >
                                {event.eventType}
                              </span>
                              <div>
                                <p className="text-sm text-slate-900 dark:text-white">
                                  {formatDate(event.occurredAt)}
                                </p>
                                {event.appVersion && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400">
                                    App v{event.appVersion}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-600 dark:text-slate-400 text-center py-4">
                        No telemetry events recorded
                      </p>
                    )}
                  </div>

                  {/* Activity Timeline */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Activity Timeline
                    </h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {device.activityHistory.map((activity) => (
                        <div
                          key={activity._id}
                          className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                        >
                          <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {activity.description}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                              {formatDate(activity.timestamp)}
                              {activity.actor && (
                                <span> • by {activity.actor.email}</span>
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Actions */}
            {device && (
              <div className="border-t border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-3 flex-wrap">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      const newName = prompt(
                        "Enter new device name:",
                        device.name
                      );
                      if (newName && newName.trim() !== device.name) {
                        handleAction("rename", { newName: newName.trim() });
                      }
                    }}
                    disabled={actionLoading}
                    className="flex items-center gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    Rename
                  </Button>

                  {device.status === "active" ? (
                    <Button
                      variant="error"
                      onClick={() => {
                        const reason = prompt("Enter reason for deactivation:");
                        if (reason) {
                          handleAction("deactivate", { reason });
                        }
                      }}
                      disabled={actionLoading}
                      className="flex items-center gap-2"
                    >
                      <PowerOff className="h-4 w-4" />
                      Deactivate
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={() => handleAction("activate")}
                      disabled={actionLoading}
                      className="flex items-center gap-2"
                    >
                      <Power className="h-4 w-4" />
                      Activate
                    </Button>
                  )}

                  <Button
                    variant="error"
                    onClick={() => {
                      const reason = prompt(
                        "Enter reason for unbinding (this will remove the device):"
                      );
                      if (
                        reason &&
                        confirm("Are you sure? This action cannot be undone.")
                      ) {
                        handleAction("unbind", { reason });
                      }
                    }}
                    disabled={actionLoading}
                    className="flex items-center gap-2"
                  >
                    <Unlink className="h-4 w-4" />
                    Unbind
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={onClose}
                    className="ml-auto"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default DeviceDetailDrawer;
