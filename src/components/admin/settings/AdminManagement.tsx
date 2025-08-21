"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Plus,
  Shield,
  ShieldCheck,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/admin/DataTable";
import { FilterConfig, ActionConfig } from "@/components/admin/types";
import AdminUserDialog from "./AdminUserDialog";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import apiClient from "@/lib/axios";

interface AdminUser {
  _id: string;
  email: string;
  name?: string;
  role: "admin";
  lastSeenAt?: string;
  createdAt: string;
}

export default function AdminManagement() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // DataTable columns configuration
  const columns = [
    {
      field: "email",
      headerName: "Email",
      width: 300,
      pinned: "left" as const,
      cellRenderer: (params: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {params.value.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-slate-900 dark:text-white">
              {params.value}
            </div>
            {params.data.name && (
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {params.data.name}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      field: "role",
      headerName: "Role",
      width: 120,
      cellRenderer: (params: any) => (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
          <ShieldCheck className="h-4 w-4" />
          Admin
        </div>
      ),
    },
    {
      field: "lastSeenAt",
      headerName: "Last Seen",
      width: 180,
      cellRenderer: (params: any) => {
        if (!params.value) {
          return (
            <span className="text-slate-400 dark:text-slate-500 text-sm">
              Never
            </span>
          );
        }

        const date = new Date(params.value);
        const isRecent = date > new Date(Date.now() - 24 * 60 * 60 * 1000);

        return (
          <div
            className={`flex items-center gap-2 ${
              isRecent
                ? "text-green-600 dark:text-green-400"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <Clock className="h-4 w-4" />
            <div>
              <div className="text-sm font-medium">
                {date.toLocaleDateString()}
              </div>
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
      field: "createdAt",
      headerName: "Created",
      width: 150,
      cellRenderer: (params: any) => {
        const date = new Date(params.value);
        return (
          <div className="text-slate-600 dark:text-slate-400">
            <div className="text-sm font-medium">
              {date.toLocaleDateString()}
            </div>
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
  ];

  // Action configuration
  const actions: ActionConfig<AdminUser>[] = [
    {
      label: "Edit",
      onClick: (admin) => {
        setSelectedAdmin(admin);
        setDialogOpen(true);
      },
      variant: "primary",
      icon: <Edit className="h-4 w-4" />,
    },
    {
      label: "Delete",
      onClick: (admin) => {
        setAdminToDelete(admin);
        setConfirmDeleteOpen(true);
      },
      variant: "error",
      icon: <Trash2 className="h-4 w-4" />,
    },
  ];

  const handleCreateAdmin = () => {
    setSelectedAdmin(null);
    setDialogOpen(true);
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
    setSelectedAdmin(null);
    // Refresh the table when dialog closes
    setRefreshKey((prev) => prev + 1);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!adminToDelete) return;

    setIsDeleting(true);
    try {
      await apiClient.delete(`/api/admin/settings/admins/${adminToDelete._id}`);

      // Refresh the table
      setRefreshKey((prev) => prev + 1);
      setConfirmDeleteOpen(false);
      setAdminToDelete(null);
    } catch (error) {
      console.error("Error deleting admin:", error);
      // You might want to show an error toast here
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Admin User Management
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Manage administrator accounts and permissions
            </p>
          </div>
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

          <Button
            variant="primary"
            onClick={handleCreateAdmin}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Admin
          </Button>
        </div>
      </motion.div>

      {/* Admin Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <DataTable<AdminUser>
          key={refreshKey}
          columns={columns}
          endpoint="/api/admin/settings/admins"
          filters={filters}
          actions={actions}
          pageSize={10}
          defaultSort={{ field: "createdAt", direction: "desc" }}
          className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-200/50 dark:border-slate-700/50"
        />
      </motion.div>

      {/* Admin User Dialog */}
      <AdminUserDialog
        isOpen={dialogOpen}
        onClose={handleDialogClose}
        admin={selectedAdmin}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => {
          setConfirmDeleteOpen(false);
          setAdminToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Admin User"
        message={
          adminToDelete
            ? `Are you sure you want to delete the admin user "${adminToDelete.email}"? This action cannot be undone.`
            : ""
        }
        confirmText="Delete Admin"
        variant="danger"
      />
    </div>
  );
}
