"use client";

import React, { useState } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Loader2, Activity, ToggleLeft, ToggleRight } from "lucide-react";

interface ActiveDeviceMetrics {
  date: string;
  dau: number;
  wau: number;
  mau: number;
  dauDevices: number;
  wauDevices: number;
  mauDevices: number;
}

interface ActiveDevicesChartProps {
  data: ActiveDeviceMetrics[];
  loading?: boolean;
  height?: number;
  onDataPointClick?: (data: any) => void;
}

type MetricType = "users" | "devices";
type ChartType = "line" | "area";

export function ActiveDevicesChart({
  data,
  loading = false,
  height = 400,
  onDataPointClick,
}: ActiveDevicesChartProps) {
  const [metricType, setMetricType] = useState<MetricType>("devices");
  const [chartType, setChartType] = useState<ChartType>("line");

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const date = new Date(label).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
          <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">
            {date}
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
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {entry.name}
                  </span>
                </div>
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {entry.value.toLocaleString()}
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
            Loading active devices data...
          </p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <Activity className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No active devices data available
          </p>
        </div>
      </div>
    );
  }

  // Format data for chart
  const chartData = data.map((item) => ({
    date: item.date,
    DAU: metricType === "users" ? item.dau : item.dauDevices,
    WAU: metricType === "users" ? item.wau : item.wauDevices,
    MAU: metricType === "users" ? item.mau : item.mauDevices,
  }));

  const colors = {
    DAU: "#3b82f6", // blue
    WAU: "#10b981", // green
    MAU: "#8b5cf6", // purple
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const ChartComponent = chartType === "area" ? AreaChart : LineChart;
  const DataComponent = chartType === "area" ? Area : Line;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Metric Type Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Show:
            </span>
            <button
              onClick={() =>
                setMetricType(metricType === "users" ? "devices" : "users")
              }
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {metricType === "users" ? (
                <ToggleRight className="h-4 w-4 text-blue-500" />
              ) : (
                <ToggleLeft className="h-4 w-4 text-slate-400" />
              )}
              <span className="capitalize">{metricType}</span>
            </button>
          </div>

          {/* Chart Type Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            {(["line", "area"] as const).map((type) => (
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
          {Object.entries(colors).map(([key, color]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {key}
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
            dataKey="date"
            tickFormatter={formatDate}
            stroke="var(--muted-foreground)"
            fontSize={12}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip content={<CustomTooltip />} />

          {Object.entries(colors).map(([key, color]) => (
            <DataComponent
              key={key}
              type="monotone"
              dataKey={key}
              stroke={color}
              strokeWidth={2}
              {...(chartType === "line"
                ? {
                    dot: { fill: color, strokeWidth: 2, r: 4 },
                    activeDot: { r: 6, stroke: color, strokeWidth: 2 },
                  }
                : {
                    fill: color,
                    fillOpacity: 0.1,
                  })}
              onClick={onDataPointClick}
            />
          ))}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}

export default ActiveDevicesChart;
