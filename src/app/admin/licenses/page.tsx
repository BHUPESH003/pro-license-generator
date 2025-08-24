"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Key,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Power,
  PowerOff,
  AlertCircle,
} from "lucide-react";
import AdminProtection from "@/components/admin/AdminProtection";
import LicenseDetailDrawer from "@/components/admin/LicenseDetailDrawer";
import { CustomDataTable } from "@/components/ui/CustomDataTable";
import {
  FilterConfig,
  ActionConfig,
  DataTableColumn,
} from "@/components/ui/CustomDataTable.types";
import { Button } from "@/components/ui/Button";
import apiClient from "@/lib/axios";

interface License {
  _id: string;
  licenseKey: string;
  status: "active" | "inactive";
  plan: string;
  mode?: "subscription" | "payment";
  planType?: "monthly" | "quarterly" | "yearly";
  purchaseDate: string;
  expiryDate: string;
  user: {
    _id: string;
    email: string;
    name?: string;
  };
  deviceCount: number;
  lastActivity?: string;
}

export default function LicensesPage() {
  const [selectedLicenseId, setSelectedLicenseId] = useState<string | null>(
    null
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // DataTable columns configuration
  const columns: DataTableColumn[] = [
    {
      field: "licenseKey",
      headerName: "License Key",
      width: 200,
      pinned: "left",
      cellRenderer: (value: any) => (
        <div className="font-mono text-sm">{value}</div>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      cellRenderer: (value: any) => {
        const status = value;
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
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            ) : (
              <div className="w-2 h-2 bg-red-500 rounded-full" />
            )}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        );
      },
    },
    {
      field: "plan",
      headerName: "Plan",
      width: 120,
    },
    {
      field: "mode",
      headerName: "Mode",
      width: 120,
      cellRenderer: (params: any) => params.value || "N/A",
    },
    {
      field: "planType",
      headerName: "Plan Type",
      width: 120,
      cellRenderer: (params: any) => params.value || "N/A",
    },
    {
      field: "user.email",
      headerName: "User Email",
      width: 200,
      valueGetter: (row: License) => row.user?.email,
    },
    {
      field: "user.name",
      headerName: "User Name",
      width: 150,
      valueGetter: (row: License) => row.user?.name || "N/A",
    },
    {
      field: "deviceCount",
      headerName: "Devices",
      width: 100,
      cellRenderer: (value: any) => (
        <div className="text-center">
          <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full text-xs font-medium">
            {value}
          </span>
        </div>
      ),
    },
    {
      field: "purchaseDate",
      headerName: "Purchase Date",
      width: 150,
      cellRenderer: (value: any) => new Date(value).toLocaleDateString(),
    },
    {
      field: "expiryDate",
      headerName: "Expiry Date",
      width: 150,
      cellRenderer: (value: any) => {
        const date = new Date(value);
        const isExpired = date < new Date();
        const isExpiringSoon =
          date < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        return (
          <div
            className={`${
              isExpired
                ? "text-red-600 dark:text-red-400"
                : isExpiringSoon
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-slate-900 dark:text-slate-100"
            }`}
          >
            {date.toLocaleDateString()}
            {isExpired && <div className="text-xs text-red-500">Expired</div>}
            {!isExpired && isExpiringSoon && (
              <div className="text-xs text-orange-500">Expiring Soon</div>
            )}
          </div>
        );
      },
    },
    {
      field: "lastActivity",
      headerName: "Last Activity",
      width: 150,
      cellRenderer: (value: any) =>
        value ? new Date(value).toLocaleDateString() : "Never",
    },
  ];

  // Filter configuration
  const filters: FilterConfig[] = [
    {
      field: "licenseKey",
      type: "text",
      label: "License Key",
      placeholder: "Search license key...",
    },
    {
      field: "userEmail",
      type: "text",
      label: "User Email",
      placeholder: "Search user email...",
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
      field: "plan",
      type: "select",
      label: "Plan",
      options: [
        { value: "Basic", label: "Basic" },
        { value: "Premium", label: "Premium" },
        { value: "Enterprise", label: "Enterprise" },
      ],
    },
    {
      field: "mode",
      type: "select",
      label: "Mode",
      options: [
        { value: "subscription", label: "Subscription" },
        { value: "payment", label: "One-time Payment" },
      ],
    },
    {
      field: "planType",
      type: "select",
      label: "Plan Type",
      options: [
        { value: "monthly", label: "Monthly" },
        { value: "quarterly", label: "Quarterly" },
        { value: "yearly", label: "Yearly" },
      ],
    },
    {
      field: "purchaseDateAfter",
      type: "date",
      label: "Purchase Date After",
    },
    {
      field: "expiryDateBefore",
      type: "date",
      label: "Expiry Date Before",
    },
  ];

  // Action configuration
  const actions: ActionConfig<License>[] = [
    {
      label: "View Details",
      onClick: (license) => {
        setSelectedLicenseId(license._id);
        setDrawerOpen(true);
      },
      variant: "primary",
      icon: <Eye className="h-4 w-4" />,
    },
    {
      label: "Activate",
      onClick: (license) => handleQuickAction(license._id, "activate"),
      variant: "primary",
      icon: <Power className="h-4 w-4" />,
      condition: (license) => license.status === "inactive",
    },
    {
      label: "Deactivate",
      onClick: (license) => handleQuickAction(license._id, "deactivate"),
      variant: "error",
      icon: <PowerOff className="h-4 w-4" />,
      condition: (license) => license.status === "active",
    },
  ];

  const handleQuickAction = async (
    licenseId: string,
    action: "activate" | "deactivate"
  ) => {
    try {
      const { data } = await apiClient.post(
        `/api/admin/licenses/${licenseId}/actions`,
        {
          action,
          reason: `Quick ${action} from license management`,
        }
      );
      if (!data.success) {
        throw new Error(data.message || `Failed to ${action} license`);
      }

      // Refresh the table
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error(`Error ${action}ing license:`, error);
      alert(
        `Failed to ${action} license: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleRowClick = (license: License) => {
    setSelectedLicenseId(license._id);
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
              License Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Monitor and manage software licenses
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
          <CustomDataTable
            key={refreshKey}
            columns={columns}
            endpoint="/api/admin/licenses"
            filters={filters}
            actions={actions}
            exportEnabled={true}
            pageSize={25}
            defaultSort={{ field: "purchaseDate", direction: "desc" }}
            onRowClick={handleRowClick}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg"
          />
        </motion.div>

        {/* License Detail Drawer */}
        <LicenseDetailDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          licenseId={selectedLicenseId}
          onActionComplete={handleDrawerActionComplete}
        />
      </div>
    </AdminProtection>
  );
}
