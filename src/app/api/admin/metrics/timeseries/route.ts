import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Device from "@/models/Device";
import TelemetryEvent from "@/models/TelemetryEvent";

interface TimeSeriesData {
  date: string;
  activeDevices: number;
  scanCount: number;
  uniqueUsers: number;
  totalEvents: number;
}

// Cache duration in seconds (10 minutes for time series data)
const CACHE_DURATION = 600;
const timeSeriesCache = new Map<
  string,
  { data: TimeSeriesData[]; timestamp: number }
>();

function getCacheKey(days: number, granularity: string): string {
  return `timeseries-${days}-${granularity}`;
}

function isCacheValid(cacheKey: string): boolean {
  const cached = timeSeriesCache.get(cacheKey);
  if (!cached) return false;
  const now = Date.now();
  return now - cached.timestamp < CACHE_DURATION * 1000;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");
    const granularity = searchParams.get("granularity") || "day"; // day, hour

    // Validate parameters
    if (days < 1 || days > 365) {
      return NextResponse.json(
        { success: false, message: "Days must be between 1 and 365" },
        { status: 400 }
      );
    }

    if (!["day", "hour"].includes(granularity)) {
      return NextResponse.json(
        { success: false, message: "Granularity must be 'day' or 'hour'" },
        { status: 400 }
      );
    }

    const cacheKey = getCacheKey(days, granularity);

    // Check cache first
    if (isCacheValid(cacheKey)) {
      const cached = timeSeriesCache.get(cacheKey)!;
      return NextResponse.json({
        success: true,
        data: cached.data,
        cached: true,
        cacheAge: Math.floor((Date.now() - cached.timestamp) / 1000),
      });
    }

    await dbConnect();

    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Determine date format and grouping based on granularity
    const dateFormat = granularity === "hour" ? "%Y-%m-%d-%H" : "%Y-%m-%d";
    const dateIncrement =
      granularity === "hour" ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

    // Generate date range for consistent time series
    const dateRange: string[] = [];
    let currentDate = new Date(startDate);

    while (currentDate <= now) {
      if (granularity === "hour") {
        dateRange.push(
          currentDate.toISOString().substring(0, 13).replace("T", "-")
        );
      } else {
        dateRange.push(currentDate.toISOString().substring(0, 10));
      }
      currentDate = new Date(currentDate.getTime() + dateIncrement);
    }

    // Parallel aggregation queries
    const [deviceActivity, telemetryActivity] = await Promise.all([
      // Daily/Hourly active devices
      Device.aggregate([
        {
          $match: {
            lastActivity: { $gte: startDate },
            status: "active",
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: dateFormat,
                date: "$lastActivity",
              },
            },
            activeDevices: { $sum: 1 },
            uniqueUsers: { $addToSet: "$userId" },
          },
        },
        {
          $addFields: {
            uniqueUserCount: { $size: "$uniqueUsers" },
          },
        },
        {
          $project: {
            _id: 1,
            activeDevices: 1,
            uniqueUsers: "$uniqueUserCount",
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]),

      // Telemetry events aggregation
      TelemetryEvent.aggregate([
        {
          $match: {
            occurredAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: {
                  format: dateFormat,
                  date: "$occurredAt",
                },
              },
              eventType: "$eventType",
            },
            count: { $sum: 1 },
            uniqueDevices: { $addToSet: "$deviceGuid" },
          },
        },
        {
          $group: {
            _id: "$_id.date",
            events: {
              $push: {
                type: "$_id.eventType",
                count: "$count",
                uniqueDevices: { $size: "$uniqueDevices" },
              },
            },
            totalEvents: { $sum: "$count" },
            allUniqueDevices: { $addToSet: "$uniqueDevices" },
          },
        },
        {
          $addFields: {
            scanCount: {
              $reduce: {
                input: "$events",
                initialValue: 0,
                in: {
                  $cond: [
                    {
                      $in: [
                        "$$this.type",
                        ["scan", "file_scan", "system_scan"],
                      ],
                    },
                    { $add: ["$$value", "$$this.count"] },
                    "$$value",
                  ],
                },
              },
            },
            uniqueDeviceCount: {
              $size: {
                $reduce: {
                  input: "$allUniqueDevices",
                  initialValue: [],
                  in: { $setUnion: ["$$value", "$$this"] },
                },
              },
            },
          },
        },
        {
          $project: {
            _id: 1,
            scanCount: 1,
            totalEvents: 1,
            uniqueDevices: "$uniqueDeviceCount",
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]),
    ]);

    // Create lookup maps for efficient data merging
    const deviceMap = new Map<string, any>();
    deviceActivity.forEach((item) => {
      deviceMap.set(item._id, item);
    });

    const telemetryMap = new Map<string, any>();
    telemetryActivity.forEach((item) => {
      telemetryMap.set(item._id, item);
    });

    // Build complete time series with all dates
    const timeSeriesData: TimeSeriesData[] = dateRange.map((date) => {
      const deviceData = deviceMap.get(date);
      const telemetryData = telemetryMap.get(date);

      return {
        date,
        activeDevices: deviceData?.activeDevices || 0,
        scanCount: telemetryData?.scanCount || 0,
        uniqueUsers: deviceData?.uniqueUsers || 0,
        totalEvents: telemetryData?.totalEvents || 0,
      };
    });

    // Update cache
    timeSeriesCache.set(cacheKey, {
      data: timeSeriesData,
      timestamp: Date.now(),
    });

    // Clean old cache entries (keep only last 10 entries)
    if (timeSeriesCache.size > 10) {
      const oldestKey = Array.from(timeSeriesCache.keys())[0];
      timeSeriesCache.delete(oldestKey);
    }

    return NextResponse.json({
      success: true,
      data: timeSeriesData,
      cached: false,
      generatedAt: new Date().toISOString(),
      metadata: {
        days,
        granularity,
        dataPoints: timeSeriesData.length,
        dateRange: {
          start: startDate.toISOString(),
          end: now.toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching time series metrics:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch time series metrics",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
