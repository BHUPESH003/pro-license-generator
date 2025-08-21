"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Key,
  Smartphone,
  Activity,
  Shield,
  BarChart3,
  Clock,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import AdminProtection from "@/components/admin/AdminProtection";
import EnhancedKPICard from "@/components/admin/EnhancedKPICard";
import InteractiveChart from "@/components/admin/InteractiveChart";
import {
  TimeRangeSelector,
  TimeRange,
  TIME_RANGES,
} from "@/components/admin/TimeRangeSelector";
import useAdminMetrics from "@/hooks/useAdminMetrics";

function QuickActionCard({
  title,
  description,
  icon: Icon,
  href,
  color = "blue",
}: {
  title: string;
  description: string;
  icon: any;
  href: string;
  color?: "blue" | "green" | "purple" | "orange";
}) {
  const colorClasses = {
    blue: "hover:from-blue-500 hover:to-blue-600",
    green: "hover:from-green-500 hover:to-green-600",
    purple: "hover:from-purple-500 hover:to-purple-600",
    orange: "hover:from-orange-500 hover:to-orange-600",
  };

  return (
    <motion.a
      href={href}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`block p-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-gradient-to-r ${colorClasses[color]} hover:text-white group`}
    >
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-700 group-hover:bg-white/20 transition-colors">
          <Icon className="h-6 w-6 text-slate-600 dark:text-slate-300 group-hover:text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-white">
            {title}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-white/80">
            {description}
          </p>
        </div>
      </div>
    </motion.a>
  );
}

export default function AdminDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>(
    TIME_RANGES[1]
  ); // 30 days default
  const {
    overview,
    timeSeries,
    loading,
    error,
    refreshMetrics,
    refreshTimeSeries,
  } = useAdminMetrics(selectedTimeRange.value);

  const handleTimeRangeChange = async (range: TimeRange) => {
    setSelectedTimeRange(range);
    await refreshTimeSeries(range.value);
  };

  const handleRefresh = async () => {
    await refreshMetrics();
  };

  // Format time series data for charts
  const chartData = timeSeries.map((item) => ({
    date: new Date(item.date).toLocaleDateString(),
    activeDevices: item.activeDevices,
    scanCount: item.scanCount,
    uniqueUsers: item.uniqueUsers,
    totalEvents: item.totalEvents,
  }));

  // Format plan mix data for pie chart
  const planMixData =
    overview?.planMix.map((item) => ({
      name: item.plan,
      value: item.count,
      percentage: item.percentage,
    })) || [];

  return (
    <AdminProtection>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              System overview and management tools
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <TimeRangeSelector
              selectedRange={selectedTimeRange}
              onRangeChange={handleTimeRangeChange}
            />

            <div className="flex items-center gap-3">
              <motion.button
                onClick={handleRefresh}
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </motion.button>

              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Clock className="h-4 w-4" />
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <span className="text-red-800 dark:text-red-200 font-medium">
                Error loading metrics
              </span>
            </div>
            <p className="text-red-700 dark:text-red-300 text-sm mt-1">
              {error}
            </p>
          </motion.div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <EnhancedKPICard
            title="Total Users"
            value={overview?.users.total || 0}
            icon={Users}
            trend={overview?.users.growth}
            subtitle="Active user accounts"
            color="blue"
            loading={loading}
            onClick={() => (window.location.href = "/admin/users")}
          />
          <EnhancedKPICard
            title="Active Licenses"
            value={overview?.licenses.active || 0}
            icon={Key}
            trend={overview?.licenses.growth}
            subtitle="Currently active licenses"
            color="green"
            loading={loading}
            onClick={() => (window.location.href = "/admin/licenses")}
          />
          <EnhancedKPICard
            title="Connected Devices"
            value={overview?.devices.active || 0}
            icon={Smartphone}
            trend={overview?.devices.growth}
            subtitle="Devices with active connections"
            color="purple"
            loading={loading}
            onClick={() => (window.location.href = "/admin/devices")}
          />
          <EnhancedKPICard
            title="Daily Events"
            value={overview?.telemetry.dailyEvents || 0}
            icon={Activity}
            trend={overview?.telemetry.growth}
            subtitle="Telemetry events today"
            color="orange"
            loading={loading}
            onClick={() => (window.location.href = "/admin/telemetry")}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InteractiveChart
            title="Active Devices Over Time"
            data={chartData}
            type="line"
            xKey="date"
            yKey={["activeDevices", "uniqueUsers"]}
            loading={loading}
            height={300}
            colors={["#3b82f6", "#10b981"]}
          />

          <InteractiveChart
            title="Plan Distribution"
            data={planMixData}
            type="pie"
            xKey="name"
            yKey="value"
            loading={loading}
            height={300}
          />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <InteractiveChart
            title="System Activity Trends"
            data={chartData}
            type="area"
            xKey="date"
            yKey={["scanCount", "totalEvents"]}
            loading={loading}
            height={350}
            colors={["#8b5cf6", "#f59e0b"]}
          />
        </div>

        {/* Quick Actions */}
        <div>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl font-semibold text-slate-900 dark:text-white mb-6"
          >
            Quick Actions
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <QuickActionCard
              title="Manage Users"
              description="View and manage user accounts"
              icon={Users}
              href="/admin/users"
              color="blue"
            />
            <QuickActionCard
              title="License Management"
              description="Monitor and manage licenses"
              icon={Key}
              href="/admin/licenses"
              color="green"
            />
            <QuickActionCard
              title="Device Overview"
              description="Track connected devices"
              icon={Smartphone}
              href="/admin/devices"
              color="purple"
            />
            <QuickActionCard
              title="Telemetry Explorer"
              description="Analyze system telemetry"
              icon={Activity}
              href="/admin/telemetry"
              color="orange"
            />
            <QuickActionCard
              title="Business Reports"
              description="View analytics and reports"
              icon={BarChart3}
              href="/admin/reports"
              color="blue"
            />
            <QuickActionCard
              title="System Settings"
              description="Configure system settings"
              icon={Shield}
              href="/admin/settings"
              color="green"
            />
          </div>
        </div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            System Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                API Services: Operational
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Database: Healthy
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Telemetry: Monitoring
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AdminProtection>
  );
}
