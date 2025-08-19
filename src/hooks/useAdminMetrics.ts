"use client";

import { useState, useEffect, useCallback } from "react";
import apiClient from "@/lib/axios";

interface MetricsOverview {
  users: {
    total: number;
    active: number;
    new: number;
    growth: number;
  };
  licenses: {
    total: number;
    active: number;
    inactive: number;
    growth: number;
  };
  devices: {
    total: number;
    active: number;
    dailyActive: number;
    growth: number;
  };
  telemetry: {
    totalEvents: number;
    dailyEvents: number;
    uniqueDevices: number;
    growth: number;
  };
  planMix: Array<{
    plan: string;
    count: number;
    percentage: number;
  }>;
  recentActivity: Array<{
    type: string;
    count: number;
    timestamp: Date;
  }>;
}

interface TimeSeriesData {
  date: string;
  activeDevices: number;
  scanCount: number;
  uniqueUsers: number;
  totalEvents: number;
}

interface UseAdminMetricsReturn {
  overview: MetricsOverview | null;
  timeSeries: TimeSeriesData[];
  loading: boolean;
  error: string | null;
  refreshMetrics: () => Promise<void>;
  refreshTimeSeries: (days: number, granularity?: string) => Promise<void>;
}

export function useAdminMetrics(
  initialDays: number = 30
): UseAdminMetricsReturn {
  const [overview, setOverview] = useState<MetricsOverview | null>(null);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async (days: number = 30) => {
    try {
      const { data } = await apiClient.get(`/api/admin/metrics/overview`, {
        params: { days },
      });

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch overview metrics");
      }

      setOverview(data.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching overview metrics:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch overview metrics"
      );
    }
  }, []);

  const fetchTimeSeries = useCallback(
    async (days: number = 30, granularity: string = "day") => {
      try {
        const { data } = await apiClient.get(`/api/admin/metrics/timeseries`, {
          params: { days, granularity },
        });

        if (!data.success) {
          throw new Error(
            data.message || "Failed to fetch time series metrics"
          );
        }

        setTimeSeries(data.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching time series metrics:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch time series metrics"
        );
      }
    },
    []
  );

  const refreshMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchOverview(initialDays),
        fetchTimeSeries(initialDays),
      ]);
    } finally {
      setLoading(false);
    }
  }, [fetchOverview, fetchTimeSeries, initialDays]);

  const refreshTimeSeries = useCallback(
    async (days: number, granularity: string = "day") => {
      await fetchTimeSeries(days, granularity);
    },
    [fetchTimeSeries]
  );

  // Initial load
  useEffect(() => {
    refreshMetrics();
  }, [refreshMetrics]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refreshMetrics();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [refreshMetrics]);

  return {
    overview,
    timeSeries,
    loading,
    error,
    refreshMetrics,
    refreshTimeSeries,
  };
}

export default useAdminMetrics;
