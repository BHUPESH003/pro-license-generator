"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  RefreshCw,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Activity,
  Database,
  Trash2,
  Settings,
} from "lucide-react";
import AdminProtection from "@/components/admin/AdminProtection";
import { DataTable } from "@/components/admin/DataTable";
import AuditDetailDrawer from "@/components/admin/AuditDetailDrawer";
import AuditRetentionDialog from "@/components/admin/AuditRetentionDialog";
import { FilterConfig, ActionConfig } from "@/components/admin/types";
import { Button } from "@/components/ui/Button";

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

export default function AuditPage() {
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [retentionDialogOpen, setRetentionDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // DataTable columns configuration
  const columns = [
    {
      field: "createdAt",
      headerName: "Timestamp",
      width: 180,
      pinned: "left" as const,
      cellRenderer: (params: any) => {
        const date = new Date(params.value);
        return (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <div>
              <div className="text-sm font-medium text-slate-900 dark:text-white">
                {date.toLocaleDateString()}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {date.toLocaleTimeString()}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      field: "actorEmail",
      headerName: "Actor",
      width: 200,
      cellRenderer: (params: any) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {params.value?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div>
            <div className="font-medium text-slate-900 dark:text-white">
              {params.value || "Unknown"}
            </div>
            {params.data.actorName && (
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {params.data.actorName}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      field: "action",
      headerName: "Action",
      width: 180,
      cellRenderer: (params: any) => {
        const actionParts = params.value.split("_");
        const entityType = actionParts[0];
        const operation = actionParts.slice(1).join("_");

        return (
          <div>
            <div className="font-medium text-slate-900 dark:text-white">
              {operation}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {entityType}
            </div>
          </div>
        );
      },
    },
    {
      field: "entityType",
      headerName: "Entity",
      width: 120,
      cellRenderer: (params: any) => (
        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
          <Database className="h-3 w-3" />
          {params.value}
        </div>
      ),
    },
    {
      field: "entityId",
      headerName: "Entity ID",
      width: 150,
      cellRenderer: (params: any) => {
        if (!params.value) {
          return <span className="text-slate-400 text-sm">-</span>;
        }
        return (
          <code className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
            {params.value.length > 15
              ? `${params.value.substring(0, 15)}...`
              : params.value}
          </code>
        );
      },
    },
    {
      field: "success",
      headerName: "Status",
      width: 100,
      cellRenderer: (params: any) => {
        const isSuccess = params.value;
        return (
          <div
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              isSuccess
                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
            }`}
          >
            {isSuccess ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <AlertCircle className="h-3 w-3" />
            )}
            {isSuccess ? "Success" : "Failed"}
          </div>
        );
      },
    },
    {
      field: "ipAddress",
      headerName: "IP Address",
      width: 130,
      cellRenderer: (params: any) => {
        if (!params.value) {
          return <span className="text-slate-400 text-sm">-</span>;
        }
        return (
          <code className="text-xs font-mono text-slate-600 dark:text-slate-400">
            {params.value}
          </code>
        );
      },
    },
  ];

  // Filter configuration
  const filters: FilterConfig[] = [
    {
      field: "actor",
      type: "text",
      label: "Actor Email",
      placeholder: "Search by actor email...",
    },
    {
      field: "action",
      type: "text",
      label: "Action",
      placeholder: "Search by action...",
    },
    {
      field: "entityType",
      type: "select",
      label: "Entity Type",
      options: [
        { value: "User", label: "User" },
        { value: "License", label: "License" },
        { value: "Device", label: "Device" },
        { value: "AdminAudit", label: "Audit" },
        { value: "Settings", label: "Settings" },
      ],
    },
    {
      field: "entityId",
      type: "text",
      label: "Entity ID",
      placeholder: "Search by entity ID...",
    },
    {
      field: "success",
      type: "select",
      label: "Status",
      options: [
        { value: "true", label: "Success" },
        { value: "false", label: "Failed" },
      ],
    },
    {
      field: "createdAfter",
      type: "date",
      label: "Created After",
    },
    {
      field: "createdBefore",
      type: "date",
      label: "Created Before",
    },
  ];

  // Action configuration
  const actions: ActionConfig<AuditLog>[] = [
    {
      label: "View Details",
      onClick: (auditLog) => {
        setSelectedAuditId(auditLog._id);
        setDrawerOpen(true);
      },
      variant: "primary",
      icon: <Eye className="h-4 w-4" />,
    },
  ];

  const handleRowClick = (auditLog: AuditLog) => {
    setSelectedAuditId(auditLog._id);
    setDrawerOpen(true);
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleRetentionSettings = () => {
    setRetentionDialogOpen(true);
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
              Audit Trail
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Monitor and review all administrative actions and system changes
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={handleRetentionSettings}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Retention
            </Button>

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

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Audit Logging Active
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                All administrative actions are automatically logged and retained
                according to your retention policy. Audit logs are immutable and
                cannot be modified after creation.
              </p>
            </div>
          </div>
        </motion.div>

        {/* DataTable */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <DataTable<AuditLog>
            key={refreshKey}
            columns={columns}
            endpoint="/api/admin/audit"
            filters={filters}
            actions={actions}
            exportEnabled={true}
            pageSize={25}
            defaultSort={{ field: "createdAt", direction: "desc" }}
            onRowClick={handleRowClick}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg"
          />
        </motion.div>

        {/* Audit Detail Drawer */}
        <AuditDetailDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          auditId={selectedAuditId}
        />

        {/* Retention Settings Dialog */}
        <AuditRetentionDialog
          isOpen={retentionDialogOpen}
          onClose={() => setRetentionDialogOpen(false)}
          onRetentionUpdate={handleRefresh}
        />
      </div>
    </AdminProtection>
  );
}
