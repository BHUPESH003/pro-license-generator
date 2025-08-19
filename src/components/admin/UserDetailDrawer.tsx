"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Mail,
  Shield,
  ShieldCheck,
  Calendar,
  Clock,
  CreditCard,
  Key,
  Smartphone,
  Activity,
  AlertCircle,
  CheckCircle,
  Settings,
  UserX,
  Power,
  PowerOff,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import apiClient from "@/lib/axios";
import { EntityDrawer } from "./EntityDrawer";

interface UserDetail {
  user: {
    _id: string;
    email: string;
    name?: string;
    role?: string;
    lastSeenAt?: string;
    stripeCustomerId?: string;
    createdAt: string;
  };
  licenses: Array<{
    _id: string;
    licenseKey: string;
    status: "active" | "inactive";
    plan: string;
    mode?: string;
    purchaseDate: string;
    expiryDate?: string;
  }>;
  devices: Array<{
    _id: string;
    name: string;
    os: string;
    deviceGuid?: string;
    status?: string;
    lastActivity: string;
    licenseId: {
      licenseKey: string;
      plan: string;
      status: string;
    };
  }>;
  auditLogs: Array<{
    _id: string;
    action: string;
    entityType: string;
    entityId: string;
    payload: any;
    createdAt: string;
    actorUserId: {
      email: string;
      name?: string;
    };
  }>;
}

interface UserDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  onActionComplete?: () => void;
}

export default function UserDetailDrawer({
  isOpen,
  onClose,
  userId,
  onActionComplete,
}: UserDetailDrawerProps) {
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "licenses" | "devices" | "audit"
  >("overview");

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetail();
    }
  }, [isOpen, userId]);

  const fetchUserDetail = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const { data } = await apiClient.get(`/api/admin/users/${userId}`);
      if (!data.success) {
        throw new Error(data.message || "Failed to fetch user details");
      }

      setUserDetail(data.data);
    } catch (error) {
      console.error("Error fetching user details:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (action: string, payload?: any) => {
    if (!userId) return;

    try {
      const { data } = await apiClient.post(`/api/admin/users/${userId}/actions`, {
        action,
        ...payload,
      });
      if (!data.success) {
        throw new Error(data.message || `Failed to ${action}`);
      }

      // Refresh user details and notify parent
      await fetchUserDetail();
      onActionComplete?.();
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      alert(
        `Failed to ${action}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleRoleChange = async () => {
    if (!userDetail) return;

    const currentRole = userDetail.user.role || "user";
    const newRole = currentRole === "admin" ? "user" : "admin";

    const confirmation = prompt(
      `Are you sure you want to change this user's role to ${newRole}? Type the user's email to confirm:`
    );

    if (confirmation !== userDetail.user.email) {
      alert("Email confirmation did not match. Role change cancelled.");
      return;
    }

    try {
      const { data } = await apiClient.put(`/api/admin/users/${userId}/role`, {
        role: newRole,
        confirmation: userDetail.user.email,
      });
      if (!data.success) {
        throw new Error(data.message || "Failed to change role");
      }

      // Refresh user details and notify parent
      await fetchUserDetail();
      onActionComplete?.();
    } catch (error) {
      console.error("Error changing role:", error);
      alert(
        `Failed to change role: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const renderOverview = () => {
    if (!userDetail) return null;

    const { user } = userDetail;
    const isAdmin = user.role === "admin";

    return (
      <div className="space-y-6">
        {/* User Info */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5" />
            User Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Email
              </label>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4 text-slate-500" />
                <span className="font-medium">{user.email}</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Name
              </label>
              <div className="mt-1">
                <span>{user.name || "Not provided"}</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Role
              </label>
              <div className="flex items-center gap-2 mt-1">
                {isAdmin ? (
                  <ShieldCheck className="h-4 w-4 text-purple-500" />
                ) : (
                  <Shield className="h-4 w-4 text-blue-500" />
                )}
                <span
                  className={`font-medium ${
                    isAdmin ? "text-purple-600" : "text-blue-600"
                  }`}
                >
                  {isAdmin ? "Administrator" : "User"}
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Created
              </label>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-slate-500" />
                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Last Seen
              </label>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="h-4 w-4 text-slate-500" />
                <span>
                  {user.lastSeenAt
                    ? new Date(user.lastSeenAt).toLocaleString()
                    : "Never"}
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Stripe Customer
              </label>
              <div className="flex items-center gap-2 mt-1">
                <CreditCard className="h-4 w-4 text-slate-500" />
                <span className="font-mono text-sm">
                  {user.stripeCustomerId || "Not linked"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  Licenses
                </p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {userDetail.licenses.length}
                </p>
              </div>
              <Key className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Devices
                </p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {userDetail.devices.length}
                </p>
              </div>
              <Smartphone className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  Audit Logs
                </p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {userDetail.auditLogs.length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={handleRoleChange}
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Change Role to {isAdmin ? "User" : "Admin"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                const newPassword = prompt(
                  "Enter new password (min 8 characters):"
                );
                if (newPassword && newPassword.length >= 8) {
                  handleQuickAction("reset_password", { newPassword });
                }
              }}
              className="flex items-center gap-2"
            >
              <Key className="h-4 w-4" />
              Reset Password
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderLicenses = () => {
    if (!userDetail) return null;

    return (
      <div className="space-y-4">
        {userDetail.licenses.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No licenses found for this user
          </div>
        ) : (
          userDetail.licenses.map((license) => (
            <div
              key={license._id}
              className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm font-medium">
                  {license.licenseKey}
                </span>
                <div
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    license.status === "active"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                  }`}
                >
                  {license.status === "active" ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <AlertCircle className="h-3 w-3" />
                  )}
                  {license.status}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>
                  <span className="text-slate-600 dark:text-slate-400">
                    Plan:
                  </span>
                  <span className="ml-1 font-medium">{license.plan}</span>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">
                    Mode:
                  </span>
                  <span className="ml-1 font-medium">
                    {license.mode || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">
                    Purchased:
                  </span>
                  <span className="ml-1">
                    {new Date(license.purchaseDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">
                    Expires:
                  </span>
                  <span className="ml-1">
                    {license.expiryDate
                      ? new Date(license.expiryDate).toLocaleDateString()
                      : "Never"}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderDevices = () => {
    if (!userDetail) return null;

    return (
      <div className="space-y-4">
        {userDetail.devices.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No devices found for this user
          </div>
        ) : (
          userDetail.devices.map((device) => (
            <div
              key={device._id}
              className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-slate-500" />
                  <span className="font-medium">{device.name}</span>
                </div>
                <div
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    device.status === "active"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                  }`}
                >
                  {device.status === "active" ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <AlertCircle className="h-3 w-3" />
                  )}
                  {device.status || "active"}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-slate-600 dark:text-slate-400">
                    OS:
                  </span>
                  <span className="ml-1 font-medium">{device.os}</span>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">
                    License:
                  </span>
                  <span className="ml-1 font-mono text-xs">
                    {device.licenseId.licenseKey}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">
                    Last Activity:
                  </span>
                  <span className="ml-1">
                    {new Date(device.lastActivity).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {device.deviceGuid && (
                <div className="mt-2 text-xs">
                  <span className="text-slate-600 dark:text-slate-400">
                    GUID:
                  </span>
                  <span className="ml-1 font-mono">{device.deviceGuid}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    );
  };

  const renderAuditLogs = () => {
    if (!userDetail) return null;

    return (
      <div className="space-y-4">
        {userDetail.auditLogs.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No audit logs found for this user
          </div>
        ) : (
          userDetail.auditLogs.map((log) => (
            <div
              key={log._id}
              className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-slate-500" />
                  <span className="font-medium">
                    {log.action.replace(/_/g, " ").toUpperCase()}
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                <div>
                  Entity: {log.entityType} ({log.entityId})
                </div>
                <div>Actor: {log.actorUserId.email}</div>
                {log.payload && Object.keys(log.payload).length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-blue-600 dark:text-blue-400">
                      View Details
                    </summary>
                    <pre className="mt-2 text-xs bg-slate-100 dark:bg-slate-700 p-2 rounded overflow-auto">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const actions = [
    {
      label: "Change Role",
      onClick: handleRoleChange,
      variant: "secondary" as const,
    },
    {
      label: "Reset Password",
      onClick: () => {
        const newPassword = prompt("Enter new password (min 8 characters):");
        if (newPassword && newPassword.length >= 8) {
          handleQuickAction("reset_password", { newPassword });
        }
      },
      variant: "secondary" as const,
    },
  ];

  return (
    <EntityDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={userDetail ? `User: ${userDetail.user.email}` : "User Details"}
      actions={actions}
    >
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <AlertCircle className="h-5 w-5" />
            <span>Error loading user details: {error}</span>
          </div>
        </div>
      )}

      {userDetail && (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="border-b border-slate-200 dark:border-slate-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "overview", label: "Overview", icon: User },
                { id: "licenses", label: "Licenses", icon: Key },
                { id: "devices", label: "Devices", icon: Smartphone },
                { id: "audit", label: "Audit Logs", icon: Activity },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === "overview" && renderOverview()}
            {activeTab === "licenses" && renderLicenses()}
            {activeTab === "devices" && renderDevices()}
            {activeTab === "audit" && renderAuditLogs()}
          </div>
        </div>
      )}
    </EntityDrawer>
  );
}
