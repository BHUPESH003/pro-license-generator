"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Database,
  CreditCard,
  Wifi,
  Shield,
  HardDrive,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Zap,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import apiClient from "@/lib/axios";

interface ComponentHealth {
  status: "healthy" | "warning" | "critical";
  message: string;
  lastCheck: string;
  responseTime?: number;
  details?: Record<string, any>;
}

interface SystemAlert {
  id: string;
  type: "error" | "warning" | "info";
  message: string;
  timestamp: string;
  component: string;
  resolved: boolean;
}

interface SystemHealthStatus {
  overall: "healthy" | "warning" | "critical";
  lastUpdated: string;
  components: {
    database: ComponentHealth;
    stripe: ComponentHealth;
    telemetry: ComponentHealth;
    authentication: ComponentHealth;
    storage: ComponentHealth;
  };
  metrics: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    activeUsers: number;
    totalRequests: number;
  };
  alerts: SystemAlert[];
}

export default function SystemHealth() {
  const [healthStatus, setHealthStatus] = useState<SystemHealthStatus | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHealthStatus();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchHealthStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchHealthStatus = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const { data } = await apiClient.get("/api/admin/settings/health");
      setHealthStatus(data.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load system health"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchHealthStatus(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "critical":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      case "warning":
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
      case "critical":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      default:
        return "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800";
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-32 bg-slate-200 dark:bg-slate-700 rounded"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !healthStatus) {
    return (
      <div className="text-center py-8">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          {error || "Failed to load system health"}
        </p>
        <Button
          onClick={() => fetchHealthStatus()}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  const componentIcons = {
    database: Database,
    stripe: CreditCard,
    telemetry: Wifi,
    authentication: Shield,
    storage: HardDrive,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              System Health Monitor
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Last updated:{" "}
              {new Date(healthStatus.lastUpdated).toLocaleString()}
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </motion.div>

      {/* Overall Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`p-6 rounded-lg border ${getStatusColor(
          healthStatus.overall
        )}`}
      >
        <div className="flex items-center gap-3">
          {getStatusIcon(healthStatus.overall)}
          <div>
            <h4 className="text-lg font-semibold capitalize">
              System Status: {healthStatus.overall}
            </h4>
            <p className="text-sm opacity-80">
              All system components are being monitored
            </p>
          </div>
        </div>
      </motion.div>

      {/* System Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Uptime
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatUptime(healthStatus.metrics.uptime)}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Response Time
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {healthStatus.metrics.responseTime}ms
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-5 w-5 text-purple-500" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Active Users
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {healthStatus.metrics.activeUsers}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Error Rate
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {healthStatus.metrics.errorRate}%
          </div>
        </div>
      </motion.div>

      {/* Component Health */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
          Component Health
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(healthStatus.components).map(
            ([key, component], index) => {
              const IconComponent =
                componentIcons[key as keyof typeof componentIcons];
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                      <span className="font-medium text-slate-900 dark:text-white capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                    </div>
                    {getStatusIcon(component.status)}
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    {component.message}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      Last check:{" "}
                      {new Date(component.lastCheck).toLocaleTimeString()}
                    </span>
                    {component.responseTime && (
                      <span>{component.responseTime}ms</span>
                    )}
                  </div>

                  {component.details && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {Object.entries(component.details).map(
                          ([detailKey, detailValue]) => (
                            <div key={detailKey}>
                              <span className="text-slate-500 dark:text-slate-400 capitalize">
                                {detailKey}:
                              </span>
                              <span className="ml-1 text-slate-700 dark:text-slate-300">
                                {String(detailValue)}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            }
          )}
        </div>
      </motion.div>

      {/* System Alerts */}
      {healthStatus.alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
            System Alerts
          </h4>

          <div className="space-y-3">
            {healthStatus.alerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.05 }}
                className={`p-4 rounded-lg border ${
                  alert.type === "error"
                    ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
                    : alert.type === "warning"
                      ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200"
                      : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {alert.type === "error" && (
                        <XCircle className="h-4 w-4" />
                      )}
                      {alert.type === "warning" && (
                        <AlertTriangle className="h-4 w-4" />
                      )}
                      {alert.type === "info" && (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      <span className="font-medium capitalize">
                        {alert.component}
                      </span>
                    </div>
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs opacity-75 mt-1">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {alert.resolved && (
                    <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded">
                      Resolved
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
