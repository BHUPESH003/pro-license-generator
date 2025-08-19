import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import License from "@/models/License";
import Device from "@/models/Device";
import TelemetryEvent from "@/models/TelemetryEvent";

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

// Cache duration in seconds (5 minutes)
const CACHE_DURATION = 300;
let metricsCache: { data: MetricsOverview; timestamp: number } | null = null;

function isCacheValid(): boolean {
  if (!metricsCache) return false;
  const now = Date.now();
  return now - metricsCache.timestamp < CACHE_DURATION * 1000;
}

export async function GET(request: NextRequest) {
  try {
    // Check cache first
    if (isCacheValid() && metricsCache) {
      return NextResponse.json({
        success: true,
        data: metricsCache.data,
        cached: true,
        cacheAge: Math.floor((Date.now() - metricsCache.timestamp) / 1000),
      });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");

    // Calculate date ranges
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const previousPeriodStart = new Date(
      startDate.getTime() - days * 24 * 60 * 60 * 1000
    );
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Parallel aggregation queries for better performance
    const [
      userMetrics,
      licenseMetrics,
      deviceMetrics,
      telemetryMetrics,
      planMixData,
      recentActivityData,
    ] = await Promise.all([
      // User metrics aggregation
      User.aggregate([
        {
          $facet: {
            total: [{ $count: "count" }],
            active: [
              {
                $match: {
                  lastSeenAt: { $gte: startDate },
                },
              },
              { $count: "count" },
            ],
            new: [
              {
                $match: {
                  _id: {
                    $gte: new Date(startDate.getTime()),
                  },
                },
              },
              { $count: "count" },
            ],
            previousPeriod: [
              {
                $match: {
                  _id: {
                    $gte: new Date(previousPeriodStart.getTime()),
                    $lt: startDate,
                  },
                },
              },
              { $count: "count" },
            ],
          },
        },
      ]),

      // License metrics aggregation
      License.aggregate([
        {
          $facet: {
            total: [{ $count: "count" }],
            active: [
              {
                $match: { status: "active" },
              },
              { $count: "count" },
            ],
            inactive: [
              {
                $match: { status: "inactive" },
              },
              { $count: "count" },
            ],
            new: [
              {
                $match: {
                  purchaseDate: { $gte: startDate },
                },
              },
              { $count: "count" },
            ],
            previousPeriod: [
              {
                $match: {
                  purchaseDate: {
                    $gte: previousPeriodStart,
                    $lt: startDate,
                  },
                },
              },
              { $count: "count" },
            ],
          },
        },
      ]),

      // Device metrics aggregation
      Device.aggregate([
        {
          $facet: {
            total: [{ $count: "count" }],
            active: [
              {
                $match: { status: "active" },
              },
              { $count: "count" },
            ],
            dailyActive: [
              {
                $match: {
                  lastActivity: { $gte: oneDayAgo },
                  status: "active",
                },
              },
              { $count: "count" },
            ],
            new: [
              {
                $match: {
                  _id: {
                    $gte: new Date(startDate.getTime()),
                  },
                },
              },
              { $count: "count" },
            ],
            previousPeriod: [
              {
                $match: {
                  _id: {
                    $gte: new Date(previousPeriodStart.getTime()),
                    $lt: startDate,
                  },
                },
              },
              { $count: "count" },
            ],
          },
        },
      ]),

      // Telemetry metrics aggregation
      TelemetryEvent.aggregate([
        {
          $facet: {
            totalEvents: [
              {
                $match: {
                  occurredAt: { $gte: startDate },
                },
              },
              { $count: "count" },
            ],
            dailyEvents: [
              {
                $match: {
                  occurredAt: { $gte: oneDayAgo },
                },
              },
              { $count: "count" },
            ],
            uniqueDevices: [
              {
                $match: {
                  occurredAt: { $gte: startDate },
                },
              },
              {
                $group: {
                  _id: "$deviceGuid",
                },
              },
              { $count: "count" },
            ],
            previousPeriodEvents: [
              {
                $match: {
                  occurredAt: {
                    $gte: previousPeriodStart,
                    $lt: startDate,
                  },
                },
              },
              { $count: "count" },
            ],
          },
        },
      ]),

      // Plan mix aggregation
      License.aggregate([
        {
          $match: { status: "active" },
        },
        {
          $group: {
            _id: "$plan",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
      ]),

      // Recent activity aggregation (last 24 hours)
      TelemetryEvent.aggregate([
        {
          $match: {
            occurredAt: { $gte: oneDayAgo },
          },
        },
        {
          $group: {
            _id: {
              type: "$eventType",
              hour: {
                $dateToString: {
                  format: "%Y-%m-%d-%H",
                  date: "$occurredAt",
                },
              },
            },
            count: { $sum: 1 },
            timestamp: { $first: "$occurredAt" },
          },
        },
        {
          $group: {
            _id: "$_id.type",
            count: { $sum: "$count" },
            timestamp: { $max: "$timestamp" },
          },
        },
        {
          $sort: { count: -1 },
        },
        {
          $limit: 10,
        },
      ]),
    ]);

    // Process results and calculate growth percentages
    const processMetrics = (current: any[], previous: any[]) => {
      const currentCount = current[0]?.count || 0;
      const previousCount = previous[0]?.count || 0;
      const growth =
        previousCount > 0
          ? ((currentCount - previousCount) / previousCount) * 100
          : currentCount > 0
          ? 100
          : 0;
      return { currentCount, growth };
    };

    // Calculate plan mix percentages
    const totalActiveLicenses = planMixData.reduce(
      (sum, item) => sum + item.count,
      0
    );
    const planMix = planMixData.map((item) => ({
      plan: item._id || "Unknown",
      count: item.count,
      percentage:
        totalActiveLicenses > 0 ? (item.count / totalActiveLicenses) * 100 : 0,
    }));

    // Format recent activity
    const recentActivity = recentActivityData.map((item) => ({
      type: item._id,
      count: item.count,
      timestamp: item.timestamp,
    }));

    // Build response
    const userStats = processMetrics(
      userMetrics[0].new,
      userMetrics[0].previousPeriod
    );
    const licenseStats = processMetrics(
      licenseMetrics[0].new,
      licenseMetrics[0].previousPeriod
    );
    const deviceStats = processMetrics(
      deviceMetrics[0].new,
      deviceMetrics[0].previousPeriod
    );
    const telemetryStats = processMetrics(
      telemetryMetrics[0].totalEvents,
      telemetryMetrics[0].previousPeriodEvents
    );

    const metricsData: MetricsOverview = {
      users: {
        total: userMetrics[0].total[0]?.count || 0,
        active: userMetrics[0].active[0]?.count || 0,
        new: userMetrics[0].new[0]?.count || 0,
        growth: userStats.growth,
      },
      licenses: {
        total: licenseMetrics[0].total[0]?.count || 0,
        active: licenseMetrics[0].active[0]?.count || 0,
        inactive: licenseMetrics[0].inactive[0]?.count || 0,
        growth: licenseStats.growth,
      },
      devices: {
        total: deviceMetrics[0].total[0]?.count || 0,
        active: deviceMetrics[0].active[0]?.count || 0,
        dailyActive: deviceMetrics[0].dailyActive[0]?.count || 0,
        growth: deviceStats.growth,
      },
      telemetry: {
        totalEvents: telemetryMetrics[0].totalEvents[0]?.count || 0,
        dailyEvents: telemetryMetrics[0].dailyEvents[0]?.count || 0,
        uniqueDevices: telemetryMetrics[0].uniqueDevices[0]?.count || 0,
        growth: telemetryStats.growth,
      },
      planMix,
      recentActivity,
    };

    // Update cache
    metricsCache = {
      data: metricsData,
      timestamp: Date.now(),
    };

    return NextResponse.json({
      success: true,
      data: metricsData,
      cached: false,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch dashboard metrics",
        error:
          process.env.NODE_ENV === "development"
            ? (error instanceof Error ? error.message : String(error))
            : undefined,
      },
      { status: 500 }
    );
  }
}
