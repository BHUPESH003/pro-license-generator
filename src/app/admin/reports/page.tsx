"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Download,
  Calendar,
  RefreshCw,
  Activity,
  Smartphone,
  PieChart,
  Loader2,
} from "lucide-react";
import AdminProtection from "@/components/admin/AdminProtection";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import PlanMixChart from "@/components/admin/reports/PlanMixChart";
import ActiveDevicesChart from "@/components/admin/reports/ActiveDevicesChart";
import FinancialChart from "@/components/admin/reports/FinancialChart";
import TimeRangeSelector from "@/components/admin/reports/TimeRangeSelector";
import { KPICard } from "@/components/admin/KPICard";
import apiClient from "@/lib/axios";

interface PlanMixData {
  planMixData: Array<{
    month: string;
    plans: Record<string, number>;
    total: number;
  }>;
  planSummary: Array<{
    plan: string;
    count: number;
    percentage: number;
  }>;
  totalLicenses: number;
}

interface ActiveDevicesData {
  metrics: Array<{
    date: string;
    dau: number;
    wau: number;
    mau: number;
    dauDevices: number;
    wauDevices: number;
    mauDevices: number;
  }>;
  summary: {
    currentDAU: number;
    currentWAU: number;
    currentMAU: number;
    currentDAUDevices: number;
    currentWAUDevices: number;
    currentMAUDevices: number;
    dauGrowth: number;
    wauGrowth: number;
    mauGrowth: number;
  };
}

interface FinancialData {
  metrics: Array<{
    period: string;
    revenue: number;
    subscriptions: number;
    newCustomers: number;
    churnedCustomers: number;
    mrr: number;
    arr: number;
  }>;
  summary: {
    totalRevenue: number;
    totalSubscriptions: number;
    activeSubscriptions: number;
    currentMRR: number;
    currentARR: number;
    revenueGrowth: number;
    subscriptionGrowth: number;
  };
  planBreakdown: Array<{
    plan: string;
    revenue: number;
    subscriptions: number;
    percentage: number;
  }>;
}

type TimeRange = "7d" | "30d" | "90d" | "1y" | "custom";
type ReportTab = "overview" | "plans" | "devices" | "financial";

export default function ReportsPage() {
  const [planMixData, setPlanMixData] = useState<PlanMixData | null>(null);
  const [activeDevicesData, setActiveDevicesData] =
    useState<ActiveDevicesData | null>(null);
  const [financialData, setFinancialData] = useState<FinancialData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [customDateRange, setCustomDateRange] = useState({
    from: "",
    to: "",
  });
  const [activeTab, setActiveTab] = useState<ReportTab>("overview");

  // Get date range for API calls
  const getDateRange = useCallback(() => {
    if (timeRange === "custom" && customDateRange.from && customDateRange.to) {
      return {
        from: customDateRange.from,
        to: customDateRange.to,
      };
    }

    const now = new Date();
    const days =
      timeRange === "7d"
        ? 7
        : timeRange === "30d"
          ? 30
          : timeRange === "90d"
            ? 90
            : 365;
    const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return {
      from: from.toISOString(),
      to: now.toISOString(),
    };
  }, [timeRange, customDateRange]);

  // Load all report data
  const loadReportData = useCallback(async () => {
    try {
      const dateRange = getDateRange();

      const [planMixResponse, activeDevicesResponse, financialResponse] =
        await Promise.all([
          apiClient.get(`/api/admin/reports/plan-mix`, {
            params: { from: dateRange.from, to: dateRange.to },
          }),
          apiClient.get(`/api/admin/reports/active-devices`, {
            params: { from: dateRange.from, to: dateRange.to },
          }),
          apiClient.get(`/api/admin/reports/financial`, {
            params: {
              from: dateRange.from,
              to: dateRange.to,
              includeStripe: true,
            },
          }),
        ]);

      if (planMixResponse.status >= 200 && planMixResponse.status < 300) {
        setPlanMixData(planMixResponse.data.data);
      }

      if (
        activeDevicesResponse.status >= 200 &&
        activeDevicesResponse.status < 300
      ) {
        setActiveDevicesData(activeDevicesResponse.data.data);
      }

      if (financialResponse.status >= 200 && financialResponse.status < 300) {
        setFinancialData(financialResponse.data.data);
      }
    } catch (error) {
      console.error("Failed to load report data:", error);
    }
  }, [getDateRange]);

  // Load data on component mount and when time range changes
  useEffect(() => {
    setLoading(true);
    loadReportData().finally(() => setLoading(false));
  }, [loadReportData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadReportData();
    setRefreshing(false);
  }, [loadReportData]);

  const handleTimeRangeChange = useCallback(
    (newRange: TimeRange, customRange?: { from: string; to: string }) => {
      setTimeRange(newRange);
      if (customRange) {
        setCustomDateRange(customRange);
      }
    },
    []
  );

  const handleExport = useCallback(
    async (reportType: string) => {
      try {
        const dateRange = getDateRange();
        const response = await apiClient.get(`/api/admin/reports/export`, {
          params: { type: reportType, from: dateRange.from, to: dateRange.to },
          responseType: "blob",
        });

        const blob = new Blob([response.data], {
          type: "text/csv;charset=utf-8;",
        });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `${reportType}-export-${
          new Date().toISOString().split("T")[0]
        }.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      } catch (error) {
        console.error("Export failed:", error);
      }
    },
    [getDateRange]
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: BarChart3 },
    { id: "plans" as const, label: "Plan Mix", icon: PieChart },
    { id: "devices" as const, label: "Active Devices", icon: Activity },
    { id: "financial" as const, label: "Financial", icon: DollarSign },
  ];

  return (
    <AdminProtection>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Business Reports
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Comprehensive analytics and business intelligence
            </p>
          </div>

          <div className="flex items-center gap-3">
            <TimeRangeSelector
              selectedRange={timeRange}
              onRangeChange={handleTimeRangeChange}
              customDateRange={customDateRange}
            />

            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 dark:border-slate-700">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Loading report data...
              </p>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {!loading && (
          <div className="space-y-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <KPICard
                    title="Total Revenue"
                    value={formatCurrency(
                      financialData?.summary.totalRevenue || 0
                    )}
                    delta={{
                      value: Math.abs(
                        financialData?.summary.revenueGrowth || 0
                      ),
                      type:
                        (financialData?.summary.revenueGrowth || 0) >= 0
                          ? "increase"
                          : "decrease",
                      period: "vs last period",
                    }}
                  />

                  <KPICard
                    title="Active Subscriptions"
                    value={(
                      financialData?.summary.activeSubscriptions || 0
                    ).toLocaleString()}
                    delta={{
                      value: Math.abs(
                        financialData?.summary.subscriptionGrowth || 0
                      ),
                      type:
                        (financialData?.summary.subscriptionGrowth || 0) >= 0
                          ? "increase"
                          : "decrease",
                      period: "vs last period",
                    }}
                  />

                  <KPICard
                    title="Daily Active Devices"
                    value={(
                      activeDevicesData?.summary.currentDAUDevices || 0
                    ).toLocaleString()}
                    delta={{
                      value: Math.abs(
                        activeDevicesData?.summary.dauGrowth || 0
                      ),
                      type:
                        (activeDevicesData?.summary.dauGrowth || 0) >= 0
                          ? "increase"
                          : "decrease",
                      period: "vs yesterday",
                    }}
                  />

                  <KPICard
                    title="Monthly Recurring Revenue"
                    value={formatCurrency(
                      financialData?.summary.currentMRR || 0
                    )}
                    delta={{
                      value: Math.abs(
                        financialData?.summary.revenueGrowth || 0
                      ),
                      type:
                        (financialData?.summary.revenueGrowth || 0) >= 0
                          ? "increase"
                          : "decrease",
                      period: "vs last month",
                    }}
                  />
                </div>

                {/* Overview Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Plan Distribution
                      </h3>
                      <Button
                        onClick={() => handleExport("plan-mix")}
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Export
                      </Button>
                    </div>
                    <PlanMixChart
                      data={planMixData?.planMixData || []}
                      loading={false}
                      height={300}
                    />
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Active Devices Trend
                      </h3>
                      <Button
                        onClick={() => handleExport("active-devices")}
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Export
                      </Button>
                    </div>
                    <ActiveDevicesChart
                      data={activeDevicesData?.metrics || []}
                      loading={false}
                      height={300}
                    />
                  </Card>
                </div>
              </motion.div>
            )}

            {/* Plan Mix Tab */}
            {activeTab === "plans" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Plan Summary Cards */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Plan Summary
                    </h3>
                    {planMixData?.planSummary.map((plan) => (
                      <Card key={plan.plan} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-slate-900 dark:text-white capitalize">
                              {plan.plan}
                            </h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {plan.count.toLocaleString()} licenses
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-slate-900 dark:text-white">
                              {plan.percentage}%
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Plan Mix Chart */}
                  <div className="lg:col-span-2">
                    <Card className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                          Plan Mix Over Time
                        </h3>
                        <Button
                          onClick={() => handleExport("plan-mix")}
                          variant="secondary"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Export CSV
                        </Button>
                      </div>
                      <PlanMixChart
                        data={planMixData?.planMixData || []}
                        loading={false}
                        height={400}
                      />
                    </Card>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Active Devices Tab */}
            {activeTab === "devices" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Device Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <KPICard
                    title="Daily Active Devices"
                    value={(
                      activeDevicesData?.summary.currentDAUDevices || 0
                    ).toLocaleString()}
                    delta={{
                      value: Math.abs(
                        activeDevicesData?.summary.dauGrowth || 0
                      ),
                      type:
                        (activeDevicesData?.summary.dauGrowth || 0) >= 0
                          ? "increase"
                          : "decrease",
                      period: "vs yesterday",
                    }}
                  />

                  <KPICard
                    title="Weekly Active Devices"
                    value={(
                      activeDevicesData?.summary.currentWAUDevices || 0
                    ).toLocaleString()}
                    delta={{
                      value: Math.abs(
                        activeDevicesData?.summary.wauGrowth || 0
                      ),
                      type:
                        (activeDevicesData?.summary.wauGrowth || 0) >= 0
                          ? "increase"
                          : "decrease",
                      period: "vs last week",
                    }}
                  />

                  <KPICard
                    title="Monthly Active Devices"
                    value={(
                      activeDevicesData?.summary.currentMAUDevices || 0
                    ).toLocaleString()}
                    delta={{
                      value: Math.abs(
                        activeDevicesData?.summary.mauGrowth || 0
                      ),
                      type:
                        (activeDevicesData?.summary.mauGrowth || 0) >= 0
                          ? "increase"
                          : "decrease",
                      period: "vs last month",
                    }}
                  />
                </div>

                {/* Active Devices Chart */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Active Devices Trend Analysis
                    </h3>
                    <Button
                      onClick={() => handleExport("active-devices")}
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Export CSV
                    </Button>
                  </div>
                  <ActiveDevicesChart
                    data={activeDevicesData?.metrics || []}
                    loading={false}
                    height={500}
                  />
                </Card>
              </motion.div>
            )}

            {/* Financial Tab */}
            {activeTab === "financial" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Financial Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <KPICard
                    title="Total Revenue"
                    value={formatCurrency(
                      financialData?.summary.totalRevenue || 0
                    )}
                    delta={{
                      value: Math.abs(
                        financialData?.summary.revenueGrowth || 0
                      ),
                      type:
                        (financialData?.summary.revenueGrowth || 0) >= 0
                          ? "increase"
                          : "decrease",
                      period: "vs last period",
                    }}
                  />

                  <KPICard
                    title="Monthly Recurring Revenue"
                    value={formatCurrency(
                      financialData?.summary.currentMRR || 0
                    )}
                  />

                  <KPICard
                    title="Annual Recurring Revenue"
                    value={formatCurrency(
                      financialData?.summary.currentARR || 0
                    )}
                  />

                  <KPICard
                    title="Active Subscriptions"
                    value={(
                      financialData?.summary.activeSubscriptions || 0
                    ).toLocaleString()}
                    delta={{
                      value: Math.abs(
                        financialData?.summary.subscriptionGrowth || 0
                      ),
                      type:
                        (financialData?.summary.subscriptionGrowth || 0) >= 0
                          ? "increase"
                          : "decrease",
                      period: "vs last period",
                    }}
                  />
                </div>

                {/* Financial Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Plan Revenue Breakdown */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Revenue by Plan
                    </h3>
                    {financialData?.planBreakdown.map((plan) => (
                      <Card key={plan.plan} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-slate-900 dark:text-white capitalize">
                              {plan.plan}
                            </h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {plan.subscriptions.toLocaleString()}{" "}
                              subscriptions
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-slate-900 dark:text-white">
                              {formatCurrency(plan.revenue)}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              {plan.percentage}%
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Financial Chart */}
                  <div className="lg:col-span-2">
                    <Card className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                          Revenue Trends
                        </h3>
                        <Button
                          onClick={() => handleExport("revenue")}
                          variant="secondary"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Export CSV
                        </Button>
                      </div>
                      <FinancialChart
                        data={
                          financialData?.metrics.map((m) => ({
                            month: m.period,
                            revenue: m.revenue,
                            subscriptions: m.subscriptions,
                            oneTime: 0, // This would need to be calculated from actual data
                          })) || []
                        }
                        loading={false}
                        height={400}
                      />
                    </Card>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </AdminProtection>
  );
}
