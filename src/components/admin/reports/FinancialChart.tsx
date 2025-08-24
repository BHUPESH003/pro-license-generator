"use client";

import React, { useState } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Loader2, DollarSign, TrendingUp } from "lucide-react";

interface FinancialData {
  month: string;
  revenue: number;
  subscriptions: number;
  oneTime: number;
  refunds?: number;
  netRevenue?: number;
}

interface FinancialChartProps {
  data: FinancialData[];
  loading?: boolean;
  height?: number;
  onDataPointClick?: (data: any) => void;
}

type ChartType = "line" | "area" | "bar";
type MetricType = "revenue" | "breakdown";

export function FinancialChart({
  data,
  loading = false,
  height = 400,
  onDataPointClick,
}: FinancialChartProps) {
  const [chartType, setChartType] = useState<ChartType>("area");
  const [metricType, setMetricType] = useState<MetricType>("revenue");

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const formatCurrency = (value: number) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(value);

      return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
          <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">
            {label}
          </p>
          {payload
            .sort((a: any, b: any) => b.value - a.value)
            .map((entry: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm capitalize text-slate-700 dark:text-slate-300">
                    {entry.name.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                </div>
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {formatCurrency(entry.value)}
                </span>
              </div>
            ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Loading financial data...
          </p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <DollarSign className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No financial data available
          </p>
        </div>
      </div>
    );
  }

  // Format data for chart
  const chartData = data.map((item) => ({
    month: item.month,
    revenue: item.revenue,
    subscriptions: item.subscriptions,
    oneTime: item.oneTime,
    refunds: item.refunds || 0,
    netRevenue: item.netRevenue || item.revenue - (item.refunds || 0),
  }));

  const colors = {
    revenue: "#3b82f6", // blue
    subscriptions: "#10b981", // green
    oneTime: "#8b5cf6", // purple
    refunds: "#ef4444", // red
    netRevenue: "#f59e0b", // orange
  };

  const formatMonth = (monthStr: string) => {
    // Format month display (e.g., "2024-01" -> "Jan 2024")
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getDataKeys = () => {
    if (metricType === "revenue") {
      return ["revenue", "netRevenue"];
    }
    return ["subscriptions", "oneTime", "refunds"];
  };

  const ChartComponent =
    chartType === "area"
      ? AreaChart
      : chartType === "bar"
        ? BarChart
        : LineChart;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Metric Type Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            {(["revenue", "breakdown"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setMetricType(type)}
                className={`px-3 py-1 text-sm rounded transition-colors capitalize ${
                  metricType === type
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Chart Type Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            {(["line", "area", "bar"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                className={`px-3 py-1 text-sm rounded transition-colors capitalize ${
                  chartType === type
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4">
          {getDataKeys().map((key) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: colors[key as keyof typeof colors] }}
              />
              <span className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="month"
            tickFormatter={formatMonth}
            stroke="var(--muted-foreground)"
            fontSize={12}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickFormatter={formatCurrency}
          />
          <Tooltip content={<CustomTooltip />} />

          {getDataKeys().map((key) => {
            const color = colors[key as keyof typeof colors];

            if (chartType === "bar") {
              return (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={color}
                  onClick={onDataPointClick}
                />
              );
            } else if (chartType === "area") {
              return (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={color}
                  fill={color}
                  fillOpacity={0.1}
                  strokeWidth={2}
                  onClick={onDataPointClick}
                />
              );
            } else {
              return (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={color}
                  strokeWidth={2}
                  dot={{ fill: color, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
                  onClick={onDataPointClick}
                />
              );
            }
          })}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}

export default FinancialChart;
