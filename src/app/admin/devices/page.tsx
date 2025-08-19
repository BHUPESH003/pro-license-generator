"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Smartphone,
  RefreshCw,
  Download,
  Eye,
  Edit3,
  Power,
  PowerOff,
  Unlink,
  Monitor,
  Activity,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import AdminProtection from "@/components/admin/AdminProtection";
import { DataTable } from "@/components/admin/DataTable";
import DeviceDetailDrawer from "@/components/admin/DeviceDetailDrawer";
import { FilterConfig, ActionConfig } from "@/components/admin/types";
import { Button } from "@/components/ui/Button";

interface Device {
  _id: string;
  name: string;
  os: string;
  deviceGuid?: string;
  status: "active" | "inactive";
  lastActivity: string;
  user: {
    _id: string;
    email: string;
    name?: string;
  };
  license: {
    _id: string;
    licenseKey: string;
    status: "active" | "inactive";
    plan: string;
  };
  telemetryStats: {
    totalEvents: number;
    lastEventDate?: string;
    recentEventTypes: string[];
  };
}

export default function DevicesPage() {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // DataTable columns configuration
  const columns = [
    {
      field: "name",
      headerName: "Device Name",
      width: 200,
      pinned: "left" as const,
      cellRenderer: (params: any) => (
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4 text-slate-500" />
          <span className="font-medium">{params.value}</span>
        </div>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      cellRenderer: (params: any) => {
        const status = params.value;
        const isActive = status === "active";
        return (
          <div
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              isActive
                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
            }`}
          >
            {isActive ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <AlertCircle className="h-3 w-3" />
            )}
            {status?.charAt(0).toUpperCase() + status?.slice(1)}
          </div>
        );
      },
    },
    {
      field: "os",
      headerName: "Operating System",
      width: 150,
      cellRenderer: (params: any) => (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>{params.value}</span>
        </div>
      ),
    },
    {
      field: "deviceGuid",
      headerName: "Device GUID",
      width: 200,
      cellRenderer: (params: any) => (
        <span className="font-mono text-sm text-slate-600 dark:text-slate-400">
          {params.value || "N/A"}
        </span>
      ),
    },
    {
      field: "user.email",
      headerName: "User Email",
      width: 200,
      valueGetter: (params: any) => params.data.user?.email,
    },
    {
      field: "user.name",
      headerName: "User Name",
      width: 150,
      valueGetter: (params: any) => params.data.user?.name || "N/A",
    },
    {
      field: "license.licenseKey",
      headerName: "License Key",
      width: 180,
      valueGetter: (params: any) => params.data.license?.licenseKey,
      cellRenderer: (params: any) => (
        <span className="font-mono text-sm">{params.value}</span>
      ),
    },
    {
      field: "license.plan",
      headerName: "License Plan",
      width: 120,
      valueGetter: (params: any) => params.data.license?.plan,
    },
    {
      field: "telemetryStats.totalEvents",
      headerName: "Events",
      width: 100,
      valueGetter: (params: any) =>
        params.data.telemetryStats?.totalEvents || 0,
      cellRenderer: (params: any) => (
        <div className="text-center">
          <span className="inline-flex items-center justify-center w-8 h-6 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 rounded text-xs font-medium">
            {params.value}
          </span>
        </div>
      ),
    },
    {
      field: "lastActivity",
      headerName: "Last Activity",
      width: 150,
      cellRenderer: (params: any) => {
        const date = new Date(params.value);
        const isRecent = date > new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours

        return (
          <div
            className={`${
              isRecent
                ? "text-green-600 dark:text-green-400"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            {date.toLocaleDateString()}
            <div className="text-xs">
              {date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        );
      },
    },
    {
      field: "telemetryStats.recentEventTypes",
      headerName: "Recent Events",
      width: 180,
      valueGetter: (params: any) =>
        params.data.telemetryStats?.recentEventTypes || [],
      cellRenderer: (params: any) => {
        const eventTypes = params.value || [];
        if (eventTypes.length === 0)
          return <span className="text-slate-400">None</span>;

        return (
          <div className="flex flex-wrap gap-1">
            {eventTypes.slice(0, 2).map((eventType: string, index: number) => (
              <span
                key={index}
                className="inline-flex px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded text-xs"
              >
                {eventType}
              </span>
            ))}
            {eventTypes.length > 2 && (
              <span className="text-xs text-slate-500">
                +{eventTypes.length - 2}
              </span>
            )}
          </div>
        );
      },
    },
  ];

  // Filter configuration
  const filters: FilterConfig[] = [
    {
      field: "name",
      type: "text",
      label: "Device Name",
      placeholder: "Search device name...",
    },
    {
      field: "deviceGuid",
      type: "text",
      label: "Device GUID",
      placeholder: "Search device GUID...",
    },
    {
      field: "userEmail",
      type: "text",
      label: "User Email",
      placeholder: "Search user email...",
    },
    {
      field: "licenseKey",
      type: "text",
      label: "License Key",
      placeholder: "Search license key...",
    },
    {
      field: "status",
      type: "select",
      label: "Status",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
    {
      field: "os",
      type: "select",
      label: "Operating System",
      options: [
        { value: "Windows", label: "Windows" },
        { value: "macOS", label: "macOS" },
        { value: "Linux", label: "Linux" },
        { value: "Android", label: "Android" },
        { value: "iOS", label: "iOS" },
      ],
    },
    {
      field: "lastActivityAfter",
      type: "date",
      label: "Last Activity After",
    },
    {
      field: "lastActivityBefore",
      type: "date",
      label: "Last Activity Before",
    },
  ];

  // Action configuration
  const actions: ActionConfig<Device>[] = [
    {
      label: "View Details",
      onClick: (device) => {
        setSelectedDeviceId(device._id);
        setDrawerOpen(true);
      },
      variant: "primary",
      icon: <Eye className="h-4 w-4" />,
    },
    {
      label: "Rename",
      onClick: (device) => handleQuickAction(device._id, "rename", device.name),
      variant: "secondary",
      icon: <Edit3 className="h-4 w-4" />,
    },
    {
      label: "Activate",
      onClick: (device) => handleQuickAction(device._id, "activate"),
      variant: "primary",
      icon: <Power className="h-4 w-4" />,
      condition: (device) => device.status === "inactive",
    },
    {
      label: "Deactivate",
      onClick: (device) => handleQuickAction(device._id, "deactivate"),
      variant: "error",
      icon: <PowerOff className="h-4 w-4" />,
      condition: (device) => device.status === "active",
    },
  ];

  const handleQuickAction = async (
    deviceId: string,
    action: "activate" | "deactivate" | "rename",
    currentName?: string
  ) => {
    try {
      let payload: any = { action };

      if (action === "rename") {
        const newName = prompt("Enter new device name:", currentName);
        if (!newName || newName.trim() === currentName) return;
        payload.newName = newName.trim();
      } else if (action === "deactivate") {
        const reason = prompt("Enter reason for deactivation:");
        if (!reason) return;
        payload.reason = reason;
      }

      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/admin/devices/${deviceId}/actions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || `Failed to ${action} device`);
      }

      // Refresh the table
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error(`Error ${action}ing device:`, error);
      alert(
        `Failed to ${action} device: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleRowClick = (device: Device) => {
    setSelectedDeviceId(device._id);
    setDrawerOpen(true);
  };

  const handleDrawerActionComplete = useCallback(() => {
    // Refresh the table when an action is completed in the drawer
    setRefreshKey((prev) => prev + 1);
  }, []);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <AdminProtection>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Device Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Monitor and manage connected devices
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>

            <Button variant="accent" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* DataTable */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <DataTable<Device>
            key={refreshKey}
            columns={columns}
            endpoint="/api/admin/devices"
            filters={filters}
            actions={actions}
            exportEnabled={true}
            pageSize={25}
            defaultSort={{ field: "lastActivity", direction: "desc" }}
            onRowClick={handleRowClick}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg"
          />
        </motion.div>

        {/* Device Detail Drawer */}
        <DeviceDetailDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          deviceId={selectedDeviceId}
          onActionComplete={handleDrawerActionComplete}
        />
      </div>
    </AdminProtection>
  );
}
