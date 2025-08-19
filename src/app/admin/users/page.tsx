"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users,
  RefreshCw,
  Download,
  Eye,
  Shield,
  ShieldCheck,
  UserX,
  Key,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
} from "lucide-react";
import AdminProtection from "@/components/admin/AdminProtection";
import { DataTable } from "@/components/admin/DataTable";
import UserDetailDrawer from "@/components/admin/UserDetailDrawer";
import UserActionDialog from "@/components/admin/UserActionDialog";
import { FilterConfig, ActionConfig } from "@/components/admin/types";
import { Button } from "@/components/ui/Button";

interface User {
  _id: string;
  email: string;
  name?: string;
  role: "admin" | "user";
  lastSeenAt?: string;
  stripeCustomerId?: string;
  createdAt: string;
  licenseCount: number;
  deviceCount: number;
}

export default function UsersPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // DataTable columns configuration
  const columns = [
    {
      field: "email",
      headerName: "Email",
      width: 250,
      pinned: "left" as const,
      cellRenderer: (params: any) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {params.value.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium">{params.value}</div>
            {params.data.name && (
              <div className="text-xs text-slate-500">{params.data.name}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      field: "role",
      headerName: "Role",
      width: 120,
      cellRenderer: (params: any) => {
        const isAdmin = params.value === "admin";
        return (
          <div
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              isAdmin
                ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
            }`}
          >
            {isAdmin ? (
              <ShieldCheck className="h-3 w-3" />
            ) : (
              <Shield className="h-3 w-3" />
            )}
            {isAdmin ? "Admin" : "User"}
          </div>
        );
      },
    },
    {
      field: "licenseCount",
      headerName: "Licenses",
      width: 100,
      cellRenderer: (params: any) => (
        <div className="text-center">
          <span className="inline-flex items-center justify-center w-8 h-6 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded text-xs font-medium">
            {params.value}
          </span>
        </div>
      ),
    },
    {
      field: "deviceCount",
      headerName: "Devices",
      width: 100,
      cellRenderer: (params: any) => (
        <div className="text-center">
          <span className="inline-flex items-center justify-center w-8 h-6 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded text-xs font-medium">
            {params.value}
          </span>
        </div>
      ),
    },
    {
      field: "lastSeenAt",
      headerName: "Last Seen",
      width: 150,
      cellRenderer: (params: any) => {
        if (!params.value) {
          return <span className="text-slate-400 text-sm">Never</span>;
        }

        const date = new Date(params.value);
        const isRecent = date > new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours

        return (
          <div
            className={`flex items-center gap-1 ${
              isRecent
                ? "text-green-600 dark:text-green-400"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <Clock className="h-3 w-3" />
            <div>
              <div className="text-sm">{date.toLocaleDateString()}</div>
              <div className="text-xs">
                {date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      field: "stripeCustomerId",
      headerName: "Stripe Customer",
      width: 150,
      cellRenderer: (params: any) => {
        if (!params.value) {
          return <span className="text-slate-400 text-sm">No customer</span>;
        }

        return (
          <div className="flex items-center gap-1">
            <CreditCard className="h-3 w-3 text-green-500" />
            <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
              {params.value.substring(0, 12)}...
            </span>
          </div>
        );
      },
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 120,
      cellRenderer: (params: any) => {
        const date = new Date(params.value);
        return (
          <div className="text-slate-600 dark:text-slate-400">
            <div className="text-sm">{date.toLocaleDateString()}</div>
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
  ];

  // Filter configuration
  const filters: FilterConfig[] = [
    {
      field: "email",
      type: "text",
      label: "Email",
      placeholder: "Search by email...",
    },
    {
      field: "name",
      type: "text",
      label: "Name",
      placeholder: "Search by name...",
    },
    {
      field: "role",
      type: "select",
      label: "Role",
      options: [
        { value: "admin", label: "Admin" },
        { value: "user", label: "User" },
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
  const actions: ActionConfig<User>[] = [
    {
      label: "View Details",
      onClick: (user) => {
        setSelectedUserId(user._id);
        setDrawerOpen(true);
      },
      variant: "primary",
      icon: <Eye className="h-4 w-4" />,
    },
    {
      label: "Change Role",
      onClick: (user) => {
        setSelectedUserId(user._id);
        setSelectedAction("change_role");
        setActionDialogOpen(true);
      },
      variant: "secondary",
      icon: <Shield className="h-4 w-4" />,
    },
    {
      label: "Reset Password",
      onClick: (user) => {
        setSelectedUserId(user._id);
        setSelectedAction("reset_password");
        setActionDialogOpen(true);
      },
      variant: "secondary",
      icon: <Key className="h-4 w-4" />,
    },
    {
      label: "Account Actions",
      onClick: (user) => {
        setSelectedUserId(user._id);
        setSelectedAction("account_actions");
        setActionDialogOpen(true);
      },
      variant: "secondary",
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  const handleRowClick = (user: User) => {
    setSelectedUserId(user._id);
    setDrawerOpen(true);
  };

  const handleActionComplete = useCallback(() => {
    // Refresh the table when an action is completed
    setRefreshKey((prev) => prev + 1);
    setActionDialogOpen(false);
    setDrawerOpen(false);
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
              User Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage user accounts, roles, and permissions
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
          <DataTable<User>
            key={refreshKey}
            columns={columns}
            endpoint="/api/admin/users"
            filters={filters}
            actions={actions}
            exportEnabled={true}
            pageSize={25}
            defaultSort={{ field: "createdAt", direction: "desc" }}
            onRowClick={handleRowClick}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg"
          />
        </motion.div>

        {/* User Detail Drawer */}
        <UserDetailDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          userId={selectedUserId}
          onActionComplete={handleActionComplete}
        />

        {/* User Action Dialog */}
        <UserActionDialog
          isOpen={actionDialogOpen}
          onClose={() => setActionDialogOpen(false)}
          userId={selectedUserId}
          action={selectedAction}
          onActionComplete={handleActionComplete}
        />
      </div>
    </AdminProtection>
  );
}
