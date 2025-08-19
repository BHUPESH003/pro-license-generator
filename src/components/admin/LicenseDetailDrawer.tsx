"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Key,
  User,
  Smartphone,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  Download,
  Loader2,
} from "lucide-react";
import { Button } from "../ui/Button";

interface LicenseDetail {
  _id: string;
  licenseKey: string;
  status: "active" | "inactive";
  plan: string;
  mode?: "subscription" | "payment";
  planType?: "monthly" | "quarterly" | "yearly";
  purchaseDate: Date;
  expiryDate: Date;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  user: {
    _id: string;
    email: string;
    name?: string;
    phone?: string;
  };
  devices: Array<{
    _id: string;
    name: string;
    os: string;
    deviceGuid?: string;
    status: "active" | "inactive";
    lastActivity: Date;
  }>;
  activityTimeline: Array<{
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
    totalDevices: number;
    activeDevices: number;
    totalEvents: number;
    lastEventDate?: Date;
    daysActive: number;
  };
}

interface LicenseDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  licenseId: string | null;
  onActionComplete?: () => void;
}

export function LicenseDetailDrawer({
  isOpen,
  onClose,
  licenseId,
  onActionComplete,
}: LicenseDetailDrawerProps) {
  const [license, setLicense] = useState<LicenseDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (isOpen && licenseId) {
      fetchLicenseDetail();
    }
  }, [isOpen, licenseId]);

  const fetchLicenseDetail = async () => {
    if (!licenseId) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/admin/licenses/${licenseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to fetch license details");
      }

      setLicense(data.data);
    } catch (err) {
      console.error("Error fetching license details:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch license details"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (
    action: "activate" | "deactivate",
    reason?: string
  ) => {
    if (!licenseId) return;

    setActionLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/admin/licenses/${licenseId}/actions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, reason }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to perform action");
      }

      // Refresh license details
      await fetchLicenseDetail();

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
      case "license_created":
      case "license_activated":
      case "license_deactivated":
        return <Key className="h-4 w-4" />;
      case "device_added":
      case "device_removed":
        return <Smartphone className="h-4 w-4" />;
      case "admin_action":
        return <Settings className="h-4 w-4" />;
      case "telemetry_event":
        return <Activity className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
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
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-slate-800 shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Key className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    License Details
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {license?.licenseKey || "Loading..."}
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
                      Loading license details...
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
                      onClick={fetchLicenseDetail}
                      className="mt-3"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : license ? (
                <div className="p-6 space-y-6">
                  {/* License Info */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                      License Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          Status
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(license.status)}
                          <span
                            className={`text-sm font-medium ${
                              license.status === "active"
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {license.status.charAt(0).toUpperCase() +
                              license.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          Plan
                        </label>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          {license.plan}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          Mode
                        </label>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          {license.mode || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          Plan Type
                        </label>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          {license.planType || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          Purchase Date
                        </label>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          {formatDate(license.purchaseDate)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          Expiry Date
                        </label>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          {formatDate(license.expiryDate)}
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
                          {license.user.email}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          Name
                        </label>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          {license.user.name || "N/A"}
                        </p>
                      </div>
                      {license.user.phone && (
                        <div>
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Phone
                          </label>
                          <p className="text-sm text-slate-900 dark:text-white mt-1">
                            {license.user.phone}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                      Statistics
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {license.statistics.totalDevices}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Total Devices
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {license.statistics.activeDevices}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Active Devices
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {license.statistics.totalEvents}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Total Events
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {license.statistics.daysActive}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Days Active
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Devices */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Smartphone className="h-5 w-5" />
                      Associated Devices ({license.devices.length})
                    </h3>
                    {license.devices.length > 0 ? (
                      <div className="space-y-3">
                        {license.devices.map((device) => (
                          <div
                            key={device._id}
                            className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded">
                                <Smartphone className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-900 dark:text-white">
                                  {device.name}
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  {device.os} • Last active:{" "}
                                  {formatDate(device.lastActivity)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(device.status)}
                              <span
                                className={`text-sm font-medium ${
                                  device.status === "active"
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                                }`}
                              >
                                {device.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-600 dark:text-slate-400 text-center py-4">
                        No devices associated with this license
                      </p>
                    )}
                  </div>

                  {/* Activity Timeline */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Activity Timeline
                    </h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {license.activityTimeline.map((activity) => (
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
            {license && (
              <div className="border-t border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-3">
                  {license.status === "active" ? (
                    <Button
                      variant="error"
                      onClick={() =>
                        handleAction(
                          "deactivate",
                          "Deactivated via admin panel"
                        )
                      }
                      disabled={actionLoading}
                      className="flex-1"
                    >
                      {actionLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <AlertCircle className="h-4 w-4 mr-2" />
                      )}
                      Deactivate License
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={() =>
                        handleAction("activate", "Activated via admin panel")
                      }
                      disabled={actionLoading}
                      className="flex-1"
                    >
                      {actionLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Activate License
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    onClick={onClose}
                    className="flex-1"
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

export default LicenseDetailDrawer;
