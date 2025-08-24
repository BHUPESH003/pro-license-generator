"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Database,
  Settings,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  Bug,
} from "lucide-react";
import AdminProtection from "@/components/admin/AdminProtection";
import { CustomDataTable } from "@/components/ui/CustomDataTable";
import {
  FilterConfig,
  ActionConfig,
  DataTableColumn,
} from "@/components/ui/CustomDataTable.types";
import { Button } from "@/components/ui/Button";

interface DemoData {
  id: number;
  name: string;
  email: string;
  status: "active" | "inactive" | "pending";
  role: "admin" | "user" | "moderator";
  lastLogin: string;
  createdAt: string;
  score: number;
  isVerified: boolean;
}

export default function DataTableDemoPage() {
  const [debugMode, setDebugMode] = useState(false);
  const [selectedRows, setSelectedRows] = useState<DemoData[]>([]);

  // Demo columns with various features
  const columns: DataTableColumn[] = [
    {
      field: "id",
      headerName: "ID",
      width: 80,
      sortable: true,
      pinned: "left",
    },
    {
      field: "name",
      headerName: "Full Name",
      width: 200,
      sortable: true,
      cellRenderer: (value: any, row: any) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {value.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-xs text-slate-500">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      sortable: true,
      cellRenderer: (value: any) => {
        const colors = {
          active:
            "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
          inactive:
            "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
          pending:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
        };
        return (
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              colors[value as keyof typeof colors]
            }`}
          >
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        );
      },
    },
    {
      field: "role",
      headerName: "Role",
      width: 120,
      sortable: true,
      cellRenderer: (value: any) => {
        const colors = {
          admin:
            "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
          moderator:
            "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
          user: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
        };
        return (
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              colors[value as keyof typeof colors]
            }`}
          >
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        );
      },
    },
    {
      field: "score",
      headerName: "Score",
      width: 100,
      sortable: true,
      align: "center",
      cellRenderer: (value: any) => (
        <div className="text-center">
          <span
            className={`font-bold ${
              value >= 80
                ? "text-green-600"
                : value >= 60
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {value}
          </span>
        </div>
      ),
    },
    {
      field: "isVerified",
      headerName: "Verified",
      width: 100,
      sortable: true,
      align: "center",
      cellRenderer: (value: any) => (
        <div className="text-center">
          {value ? (
            <span className="text-green-600">✓</span>
          ) : (
            <span className="text-red-600">✗</span>
          )}
        </div>
      ),
    },
    {
      field: "lastLogin",
      headerName: "Last Login",
      width: 150,
      sortable: true,
      valueFormatter: (value: any) => {
        if (!value) return "Never";
        return new Date(value).toLocaleDateString();
      },
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 150,
      sortable: true,
      valueFormatter: (value: any) => new Date(value).toLocaleDateString(),
    },
  ];

  // Demo filters
  const filters: FilterConfig[] = [
    {
      field: "name",
      type: "text",
      label: "Name",
      placeholder: "Search by name...",
    },
    {
      field: "email",
      type: "text",
      label: "Email",
      placeholder: "Search by email...",
    },
    {
      field: "status",
      type: "select",
      label: "Status",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "pending", label: "Pending" },
      ],
    },
    {
      field: "role",
      type: "select",
      label: "Role",
      options: [
        { value: "admin", label: "Admin" },
        { value: "moderator", label: "Moderator" },
        { value: "user", label: "User" },
      ],
    },
    {
      field: "score",
      type: "number",
      label: "Min Score",
      placeholder: "Minimum score...",
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

  // Demo actions
  const actions: ActionConfig<DemoData>[] = [
    {
      label: "View",
      onClick: (row) => {
        alert(`Viewing user: ${row.name}`);
      },
      variant: "secondary",
      icon: <Eye className="h-4 w-4" />,
    },
    {
      label: "Edit",
      onClick: (row) => {
        alert(`Editing user: ${row.name}`);
      },
      variant: "secondary",
      icon: <Edit className="h-4 w-4" />,
      disabled: (row) => row.status === "inactive",
    },
    {
      label: "Delete",
      onClick: (row) => {
        if (confirm(`Are you sure you want to delete ${row.name}?`)) {
          alert(`Deleted user: ${row.name}`);
        }
      },
      variant: "error",
      icon: <Trash2 className="h-4 w-4" />,
      disabled: (row) => row.role === "admin",
    },
  ];

  const handleRowClick = (row: DemoData) => {
    console.log("Row clicked:", row);
  };

  const handleRowSelect = (rows: DemoData[]) => {
    setSelectedRows(rows);
    console.log("Selected rows:", rows);
  };

  const handleFiltersChange = (filters: Record<string, unknown>) => {
    console.log("Filters changed:", filters);
  };

  const handleExport = (data: DemoData[]) => {
    console.log("Exporting data:", data);
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
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Database className="h-8 w-8 text-blue-600" />
              DataTable Demo
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Comprehensive demonstration of CustomDataTable features
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant={debugMode ? "error" : "secondary"}
              onClick={() => setDebugMode(!debugMode)}
              className="flex items-center gap-2"
            >
              <Bug className="h-4 w-4" />
              {debugMode ? "Disable Debug" : "Enable Debug"}
            </Button>

            <Button
              variant="secondary"
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>

            <Button variant="accent" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Demo
            </Button>
          </div>
        </motion.div>

        {/* Feature Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              Advanced Filtering
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Text, select, date, and number filters with debouncing
            </p>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              Global Search
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Search across all columns with highlighting
            </p>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              Row Actions
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Conditional actions with proper event handling
            </p>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              Performance
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Optimized rendering with caching and memoization
            </p>
          </div>
        </motion.div>

        {/* Selection Info */}
        {selectedRows.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
          >
            <p className="text-blue-800 dark:text-blue-200">
              <strong>{selectedRows.length}</strong> row
              {selectedRows.length !== 1 ? "s" : ""} selected
            </p>
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="secondary">
                Bulk Edit
              </Button>
              <Button size="sm" variant="error">
                Bulk Delete
              </Button>
            </div>
          </motion.div>
        )}

        {/* DataTable */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <CustomDataTable
            columns={columns}
            endpoint="/api/admin/demo-data" // This would be a demo endpoint
            filters={filters}
            actions={actions as any}
            exportEnabled={true}
            selectionEnabled={true}
            searchEnabled={true}
            pageSize={25}
            defaultSort={{ field: "createdAt", direction: "desc" }}
            onRowClick={handleRowClick}
            onRowSelect={handleRowSelect}
            onFiltersChange={handleFiltersChange}
            onExport={handleExport}
            debugMode={debugMode}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg"
            height="600px"
          />
        </motion.div>

        {/* Feature Documentation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-6"
        >
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Features Demonstrated
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                Core Features
              </h3>
              <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                <li>• Sortable columns with visual indicators</li>
                <li>• Advanced filtering with multiple types</li>
                <li>• Global search with result highlighting</li>
                <li>• Row selection with bulk operations</li>
                <li>• Pagination with configurable page sizes</li>
                <li>• CSV export functionality</li>
                <li>• Custom cell renderers</li>
                <li>• Conditional row actions</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                Advanced Features
              </h3>
              <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                <li>• URL state synchronization</li>
                <li>• Intelligent caching system</li>
                <li>• Request deduplication</li>
                <li>• Performance monitoring</li>
                <li>• Debug mode with metrics</li>
                <li>• Accessibility compliance</li>
                <li>• Dark/light theme support</li>
                <li>• Mobile responsive design</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </AdminProtection>
  );
}
