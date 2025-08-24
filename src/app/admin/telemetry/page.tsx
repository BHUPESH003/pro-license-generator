"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  RefreshCw,
  Download,
  Eye,
  Filter,
  TrendingUp,
  BarChart3,
  Calendar,
  Search,
  Database,
} from "lucide-react";
import AdminProtection from "@/components/admin/AdminProtection";
import { CustomDataTable } from "@/components/ui/CustomDataTable";
import { DataTableColumn } from "@/components/ui/CustomDataTable.types";
import TelemetryDetailDrawer from "@/components/admin/TelemetryDetailDrawer";
import TelemetryTrendChart from "@/components/admin/TelemetryTrendChart";
import { FilterConfig, ActionConfig } from "@/components/ui/CustomDataTable.types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import apiClient from "@/lib/axios";

interface TelemetryEvent {
  _id: string;
  occurredAt: string;
  eventType: string;
  appVersion?: string;
  os?: string;
  metadata?: Record<string, any>;
  idempotencyKey?: string;
  deviceGuid: string;
  sessionId?: string;
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
}

interface TelemetryStats {
  totalEvents: number;
  eventsToday: number;
  eventsThisWeek: number;
  eventsThisMonth: number;
  uniqueDevicesToday: number;
  uniqueDevicesThisWeek: number;
  uniqueDevicesThisMonth: number;
  uniqueUsersToday: number;
  uniqueUsersThisWeek: number;
  uniqueUsersThisMonth: number;
  topEventTypes: Array<{
    eventType: string;
    count: number;
  }>;
  recentActivity: Array<{
    date: string;
    count: number;
  }>;
}

export default function TelemetryPage() {
  const [selectedEvent, setSelectedEvent] = useState<TelemetryEvent | null>(
    null
  );
  const [showTrendChart, setShowTrendChart] = useState(false);
  const [stats, setStats] = useState<TelemetryStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<Record<string, any>>({});

  // Load telemetry stats
  const loadStats = useCallback(async () => {
    try {
      const { data } = await apiClient.get("/api/admin/telemetry/stats");
      setStats(data.data);
    } catch (error) {
      console.error("Failed to load telemetry stats:", error);
    }
  }, []);

  // Load stats on component mount
  React.useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStats();
    // Refresh the data table
    const gridApi = (window as any).telemetryGridApi;
    if (gridApi) {
      gridApi.refreshServerSide();
    }
    setRefreshing(false);
  }, [loadStats]);

  const handleRowClick = useCallback((event: TelemetryEvent) => {
    setSelectedEvent(event);
  }, []);

  const handleExport = useCallback(async () => {
    try {
      const params: Record<string, any> = { export: "csv" };
      const tableState = (window as any).telemetryTableState;
      if (tableState?.filters) {
        Object.entries(tableState.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params[`filter_${key}`] = value;
          }
        });
      }

      const response = await apiClient.get("/api/admin/telemetry/events", {
        params,
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8;",
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `telemetry-events-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Export failed:", error);
    }
  }, []);

  const filters: FilterConfig[] = useMemo(
    () => [
      {
        field: "deviceGuid",
        label: "Device GUID",
        type: "text",
        placeholder: "Search by device GUID...",
      },
      {
        field: "licenseKey",
        label: "License Key",
        type: "text",
        placeholder: "Search by license key...",
      },
      {
        field: "userEmail",
        label: "User Email",
        type: "text",
        placeholder: "Search by user email...",
      },
      {
        field: "eventType",
        label: "Event Type",
        type: "text",
        placeholder: "Search by event type...",
      },
      {
        field: "occurredAfter",
        label: "From Date",
        type: "date",
      },
      {
        field: "occurredBefore",
        label: "To Date",
        type: "date",
      },
      {
        field: "appVersion",
        label: "App Version",
        type: "text",
        placeholder: "Search by app version...",
      },
      {
        field: "os",
        label: "Operating System",
        type: "text",
        placeholder: "Search by OS...",
      },
      {
        field: "sessionId",
        label: "Session ID",
        type: "text",
        placeholder: "Search by session ID...",
      },
    ],
    []
  );

  const actions: ActionConfig<TelemetryEvent>[] = useMemo(
    () => [
      {
        label: "View Details",
        icon: <Eye className="h-4 w-4" />,
        onClick: (event) => setSelectedEvent(event),
        variant: "primary",
      },
    ],
    []
  );

  const columns: DataTableColumn[] = useMemo(
    () => [
      {
        field: "occurredAt",
        headerName: "Occurred At",
        width: 180,
        valueFormatter: (value: any) => {
          return new Date(value).toLocaleString();
        },
        sortable: true,
      },
      {
        field: "eventType",
        headerName: "Event Type",
        width: 150,
        sortable: true,
      },
      {
        field: "deviceGuid",
        headerName: "Device GUID",
        width: 200,
        sortable: true,
      },
      {
        field: "user.email",
        headerName: "User Email",
        width: 200,
        valueGetter: (row: TelemetryEvent) => row?.user?.email || "",
        sortable: true,
      },
      {
        field: "license.licenseKey",
        headerName: "License Key",
        width: 150,
        valueGetter: (row: TelemetryEvent) => row?.license?.licenseKey || "",
        sortable: true,
      },
      {
        field: "appVersion",
        headerName: "App Version",
        width: 120,
        sortable: true,
      },
      {
        field: "os",
        headerName: "OS",
        width: 100,
        sortable: true,
      },
      {
        field: "sessionId",
        headerName: "Session ID",
        width: 150,
        sortable: true,
      },
      {
        field: "metadata",
        headerName: "Metadata",
        width: 150,
        cellRenderer: (value: any, row: any) => {
          const metadata = value;
          if (!metadata || typeof metadata !== "object")
            return <span className="text-gray-400 text-xs">No metadata</span>;
          const keys = Object.keys(metadata);
          if (keys.length === 0)
            return <span className="text-gray-400 text-xs">Empty</span>;

          return (
            <div className="flex items-center gap-2">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {keys.length} {keys.length === 1 ? "field" : "fields"}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEvent(row);
                }}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                View
              </button>
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <AdminProtection>
      <div className="space-y-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Telemetry Explorer
            </h1>
            <p className="text-gray-600">
              Explore and analyze telemetry events with advanced filtering and
              trend analysis
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowTrendChart(!showTrendChart)}
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              {showTrendChart ? "Hide" : "Show"} Trends
            </Button>
            <Button
              variant="secondary"
              onClick={handleExport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button
              variant="primary"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Events
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalEvents.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">All time</p>
                </div>
                <Database className="h-8 w-8 text-blue-600" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Events Today
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.eventsToday.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    This week: {stats.eventsThisWeek.toLocaleString()}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Devices
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.uniqueDevicesToday.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Today / Week: {stats.uniqueDevicesThisWeek.toLocaleString()}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Users
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.uniqueUsersToday.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Today / Week: {stats.uniqueUsersThisWeek.toLocaleString()}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-orange-600" />
              </div>
            </Card>
          </div>
        )}

        {/* Top Event Types */}
        {stats && stats.topEventTypes.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Top Event Types (Last 30 Days)
              </h2>
              <BarChart3 className="h-5 w-5 text-gray-600" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.topEventTypes.slice(0, 6).map((eventType, index) => (
                <div
                  key={eventType.eventType}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: [
                          "#3B82F6",
                          "#EF4444",
                          "#10B981",
                          "#F59E0B",
                          "#8B5CF6",
                          "#EC4899",
                        ][index % 6],
                      }}
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {eventType.eventType}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 font-mono">
                    {eventType.count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Trend Chart */}
        {showTrendChart && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6 admin-glass">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Telemetry Trends
                </h2>
                <BarChart3 className="h-5 w-5 text-gray-600" />
              </div>
              <TelemetryTrendChart filters={currentFilters} />
            </Card>
          </motion.div>
        )}

        {/* Data Table */}
        <Card className="p-6 bg-transparent shadow-none border-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Telemetry Events
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Explore telemetry data with advanced filtering and search
                capabilities
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter className="h-4 w-4" />
              Use filters to narrow down results
            </div>
          </div>

          <div className="max-h-[70vh] overflow-auto">
            <CustomDataTable
              columns={columns}
              endpoint="/api/admin/telemetry/events"
              filters={filters}
              actions={actions}
              defaultSort={{ field: "occurredAt", direction: "desc" }}
              exportEnabled={true}
              pageSize={25}
              onRowClick={handleRowClick}
              onFiltersChange={setCurrentFilters}
              className="h-[600px]"
            />
          </div>
        </Card>

        {/* Detail Drawer */}
        {selectedEvent && (
          <TelemetryDetailDrawer
            event={selectedEvent}
            isOpen={!!selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </div>
    </AdminProtection>
  );
}
