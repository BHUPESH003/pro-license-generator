"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";
import apiClient from "@/lib/axios";

interface TelemetryVolumeData {
  date: string;
  count: number;
  eventTypes: Record<string, number>;
}

interface TelemetryEventTypeStats {
  eventType: string;
  count: number;
  percentage: number;
}

interface TelemetrySummaryData {
  volumeOverTime: TelemetryVolumeData[];
  eventTypeStats: TelemetryEventTypeStats[];
  totalEvents: number;
  dateRange: {
    from: string;
    to: string;
  };
}

type ChartType = "line" | "bar" | "pie";
type TimeRange = "7d" | "30d" | "90d";

const COLORS = [
  "#3B82F6",
  "#EF4444",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
  "#F97316",
  "#6366F1",
];

interface TelemetryTrendChartProps {
  filters?: Record<string, any>;
}

export default function TelemetryTrendChart({
  filters = {},
}: TelemetryTrendChartProps) {
  const [data, setData] = useState<TelemetrySummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<ChartType>("line");
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = new URL(
        "/api/admin/telemetry/summary",
        window.location.origin
      );

      // Set date range based on selection
      const now = new Date();
      const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      url.searchParams.set("from", from.toISOString());
      url.searchParams.set("to", now.toISOString());
      url.searchParams.set("granularity", timeRange === "7d" ? "hour" : "day");

      // Apply filters from parent component
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.set(`filter_${key}`, value.toString());
        }
      });

      const { data } = await apiClient.get(url.toString());
      setData(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [timeRange, filters]);

  const chartData = useMemo(() => {
    if (!data) return [];

    return data.volumeOverTime.map((item) => ({
      date: new Date(item.date).toLocaleDateString(),
      count: item.count,
      ...item.eventTypes,
    }));
  }, [data]);

  const pieData = useMemo(() => {
    if (!data) return [];

    return data.eventTypeStats.slice(0, 10).map((item, index) => ({
      name: item.eventType,
      value: item.count,
      percentage: item.percentage,
      color: COLORS[index % COLORS.length],
    }));
  }, [data]);

  const renderChart = () => {
    if (loading) {
      return (
        <div className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-2">{error}</p>
            <Button onClick={loadData} variant="secondary">
              Retry
            </Button>
          </div>
        </div>
      );
    }

    if (!data || chartData.length === 0) {
      return (
        <div className="h-80 flex items-center justify-center">
          <p className="text-gray-500">
            No data available for the selected time range
          </p>
        </div>
      );
    }

    switch (chartType) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={(label) => `Date: ${label}`}
                formatter={(value, name) => [
                  value,
                  name === "count" ? "Total Events" : name,
                ]}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "bar":
        return (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={(label) => `Date: ${label}`}
                formatter={(value, name) => [
                  value,
                  name === "count" ? "Total Events" : name,
                ]}
              />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} (${percentage}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, "Events"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Time Range:
            </span>
            <div className="flex rounded-lg border border-gray-300">
              {[
                { key: "7d", label: "7 Days" },
                { key: "30d", label: "30 Days" },
                { key: "90d", label: "90 Days" },
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => setTimeRange(option.key as TimeRange)}
                  className={`px-3 py-1 text-sm font-medium transition-colors ${
                    timeRange === option.key
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  } ${
                    option.key === "7d"
                      ? "rounded-l-lg"
                      : option.key === "90d"
                        ? "rounded-r-lg"
                        : ""
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Chart Type:</span>
          <div className="flex rounded-lg border border-gray-300">
            {[
              { key: "line", label: "Line", icon: TrendingUp },
              { key: "bar", label: "Bar", icon: BarChart3 },
              { key: "pie", label: "Pie", icon: PieChartIcon },
            ].map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.key}
                  onClick={() => setChartType(option.key as ChartType)}
                  className={`px-3 py-1 text-sm font-medium transition-colors flex items-center gap-1 ${
                    chartType === option.key
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  } ${
                    option.key === "line"
                      ? "rounded-l-lg"
                      : option.key === "pie"
                        ? "rounded-r-lg"
                        : ""
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg border border-gray-200">
        {renderChart()}
      </div>

      {/* Summary Stats */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {data.totalEvents.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Events</p>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {data.eventTypeStats.length}
              </p>
              <p className="text-sm text-gray-600">Event Types</p>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {Math.round(data.totalEvents / data.volumeOverTime.length || 0)}
              </p>
              <p className="text-sm text-gray-600">Avg Events/Day</p>
            </div>
          </Card>
        </div>
      )}

      {/* Top Event Types */}
      {data && data.eventTypeStats.length > 0 && (
        <Card className="p-4">
          <h4 className="text-lg font-medium text-gray-900 mb-3">
            Top Event Types
          </h4>
          <div className="space-y-2">
            {data.eventTypeStats.slice(0, 5).map((eventType, index) => (
              <div
                key={eventType.eventType}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm font-medium text-gray-900">
                    {eventType.eventType}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {eventType.count.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({eventType.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
