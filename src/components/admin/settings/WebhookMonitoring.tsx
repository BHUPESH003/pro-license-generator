"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Webhook,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Activity,
  Play,
  ExternalLink,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface WebhookStatus {
  id: string;
  url: string;
  status: "active" | "inactive" | "error";
  events: string[];
  lastEvent?: {
    id: string;
    type: string;
    created: number;
    status: string;
  };
  statistics: {
    totalEvents: number;
    successfulEvents: number;
    failedEvents: number;
    successRate: number;
  };
}

interface WebhookHealth {
  overall: "healthy" | "warning" | "critical";
  webhooks: WebhookStatus[];
  recentEvents: Array<{
    id: string;
    type: string;
    created: number;
    status: string;
    attempts: number;
  }>;
  summary: {
    totalWebhooks: number;
    activeWebhooks: number;
    totalEvents24h: number;
    successRate24h: number;
  };
}

export default function WebhookMonitoring() {
  const [webhookHealth, setWebhookHealth] = useState<WebhookHealth | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWebhookStatus();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchWebhookStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchWebhookStatus = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/admin/settings/webhooks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch webhook status");
      }

      const data = await response.json();
      setWebhookHealth(data.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load webhook status"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchWebhookStatus(true);
  };

  const handleTestWebhook = async (webhookId: string) => {
    setTesting(webhookId);

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/admin/settings/webhooks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ webhookId }),
      });

      if (!response.ok) {
        throw new Error("Failed to test webhook");
      }

      // Refresh webhook status after test
      await fetchWebhookStatus(true);
    } catch (err) {
      console.error("Error testing webhook:", err);
    } finally {
      setTesting(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
      case "succeeded":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "inactive":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "error":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "active":
        return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      case "warning":
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
      case "critical":
      case "inactive":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      default:
        return "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
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

  if (error || !webhookHealth) {
    return (
      <div className="text-center py-8">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          {error || "Failed to load webhook status"}
        </p>
        <Button
          onClick={() => fetchWebhookStatus()}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Webhook className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Webhook Monitoring
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Monitor Stripe webhook health and delivery status
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
          webhookHealth.overall
        )}`}
      >
        <div className="flex items-center gap-3">
          {getStatusIcon(webhookHealth.overall)}
          <div>
            <h4 className="text-lg font-semibold capitalize">
              Webhook Status: {webhookHealth.overall}
            </h4>
            <p className="text-sm opacity-80">
              {webhookHealth.summary.activeWebhooks} of{" "}
              {webhookHealth.summary.totalWebhooks} webhooks active
            </p>
          </div>
        </div>
      </motion.div>

      {/* Summary Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3 mb-2">
            <Webhook className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Active Webhooks
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {webhookHealth.summary.activeWebhooks}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Events (24h)
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {webhookHealth.summary.totalEvents24h}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Success Rate
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {webhookHealth.summary.successRate24h.toFixed(1)}%
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Webhooks
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {webhookHealth.summary.totalWebhooks}
          </div>
        </div>
      </motion.div>

      {/* Webhook Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
          Webhook Endpoints
        </h4>

        <div className="space-y-4">
          {webhookHealth.webhooks.map((webhook, index) => (
            <motion.div
              key={webhook.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(webhook.status)}
                    <div>
                      <h5 className="font-medium text-slate-900 dark:text-white">
                        Webhook Endpoint
                      </h5>
                      <code className="text-sm text-slate-600 dark:text-slate-400 font-mono">
                        {webhook.url}
                      </code>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {webhook.events.slice(0, 3).map((event) => (
                      <span
                        key={event}
                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                      >
                        {event}
                      </span>
                    ))}
                    {webhook.events.length > 3 && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        +{webhook.events.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleTestWebhook(webhook.id)}
                  disabled={testing === webhook.id}
                  className="flex items-center gap-2"
                >
                  <Play className="h-3 w-3" />
                  {testing === webhook.id ? "Testing..." : "Test"}
                </Button>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-slate-900 dark:text-white">
                    {webhook.statistics.totalEvents}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    Total Events
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {webhook.statistics.successfulEvents}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    Successful
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                    {webhook.statistics.failedEvents}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    Failed
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {webhook.statistics.successRate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    Success Rate
                  </div>
                </div>
              </div>

              {/* Last Event */}
              {webhook.lastEvent && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-400">
                        Last event:
                      </span>
                      <code className="text-slate-900 dark:text-white font-mono">
                        {webhook.lastEvent.type}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(webhook.lastEvent.status)}
                      <span className="text-slate-600 dark:text-slate-400">
                        {new Date(
                          webhook.lastEvent.created * 1000
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Events */}
      {webhookHealth.recentEvents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
            Recent Events
          </h4>

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {webhookHealth.recentEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.02 }}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(event.status)}
                      <div>
                        <code className="text-sm font-mono text-slate-900 dark:text-white">
                          {event.type}
                        </code>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          ID: {event.id}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-900 dark:text-white">
                        {new Date(event.created * 1000).toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {event.attempts} attempt
                        {event.attempts !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
