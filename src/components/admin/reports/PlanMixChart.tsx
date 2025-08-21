"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Loader2, BarChart3 } from "lucide-react";

interface PlanMixData {
  month: string;
  plans: Record<string, number>;
  total: number;
}

interface PlanMixChartProps {
  data: PlanMixData[];
  loading?: boolean;
  height?: number;
  onDataPointClick?: (data: any) => void;
}

const PLAN_COLORS = {
  basic: "#3b82f6",
  pro: "#10b981",
  premium: "#8b5cf6",
  enterprise: "#f59e0b",
  starter: "#06b6d4",
  business: "#ef4444",
};

export function PlanMixChart({
  data,
  loading = false,
  height = 400,
  onDataPointClick,
}: PlanMixChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce(
        (sum: number, item: any) => sum + item.value,
        0
      );

      return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
          <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">
            {label}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            Total: {total.toLocaleString()} licenses
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
                    {entry.dataKey}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {entry.value.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0}%
                  </div>
                </div>
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
            Loading plan mix data...
          </p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <BarChart3 className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No plan mix data available
          </p>
        </div>
      </div>
    );
  }

  // Transform data for stacked bar chart
  const chartData = data.map((item) => ({
    month: item.month,
    total: item.total,
    ...item.plans,
  }));

  // Get all unique plan names
  const allPlans = Array.from(
    new Set(data.flatMap((item) => Object.keys(item.plans)))
  ).sort();

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="month"
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickFormatter={(value) => {
            // Format month display (e.g., "2024-01" -> "Jan 2024")
            const [year, month] = value.split("-");
            const date = new Date(parseInt(year), parseInt(month) - 1);
            return date.toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            });
          }}
        />
        <YAxis
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickFormatter={(value) => value.toLocaleString()}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{
            paddingTop: "20px",
          }}
          formatter={(value) => (
            <span className="capitalize text-sm">{value}</span>
          )}
        />
        {allPlans.map((plan, index) => (
          <Bar
            key={plan}
            dataKey={plan}
            stackId="plans"
            fill={
              PLAN_COLORS[plan as keyof typeof PLAN_COLORS] ||
              `hsl(${(index * 137.5) % 360}, 70%, 50%)`
            }
            onClick={onDataPointClick}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export default PlanMixChart;
