import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Device from "@/models/Device";
import TelemetryEvent from "@/models/TelemetryEvent";

interface DeviceStats {
  overview: {
    total: number;
    active: number;
    inactive: number;
    recentlyActive: number; // Active within last 7 days
  };
  osDistribution: Array<{
    os: string;
    count: number;
    percentage: number;
  }>;
  activityTrends: Array<{
    date: string;
    activeDevices: number;
    newDevices: number;
  }>;
  telemetryStats: {
    totalEvents: number;
    devicesWithTelemetry: number;
    averageEventsPerDevice: number;
    topEventTypes: Array<{
      eventType: string;
      count: number;
      deviceCount: number;
    }>;
  };
  filterOptions: {
    operatingSystems: string[];
    statusOptions: Array<{
      value: string;
      label: string;
      count: number;
    }>;
  };
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");

    // Calculate date ranges
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const recentActivityDate = new Date(
      now.getTime() - 7 * 24 * 60 * 60 * 1000
    ); // 7 days ago

    // Parallel aggregation queries
    const [
      overviewStats,
      osDistribution,
      activityTrends,
      telemetryStats,
      filterOptions,
    ] = await Promise.all([
      // Overview statistics
      Device.aggregate([
        {
          $facet: {
            total: [{ $count: "count" }],
            active: [{ $match: { status: "active" } }, { $count: "count" }],
            inactive: [{ $match: { status: "inactive" } }, { $count: "count" }],
            recentlyActive: [
              {
                $match: {
                  status: "active",
                  lastActivity: { $gte: recentActivityDate },
                },
              },
              { $count: "count" },
            ],
          },
        },
      ]),

      // OS distribution
      Device.aggregate([
        {
          $group: {
            _id: "$os",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),

      // Activity trends (devices created and active by day)
      Device.aggregate([
        {
          $facet: {
            newDevices: [
              {
                $match: {
                  _id: {
                    $gte: new Date(startDate.getTime()),
                  },
                },
              },
              {
                $group: {
                  _id: {
                    $dateToString: {
                      format: "%Y-%m-%d",
                      date: "$_id",
                    },
                  },
                  count: { $sum: 1 },
                },
              },
              { $sort: { _id: 1 } },
            ],
            activeDevices: [
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
                      format: "%Y-%m-%d",
                      date: "$lastActivity",
                    },
                  },
                  count: { $sum: 1 },
                },
              },
              { $sort: { _id: 1 } },
            ],
          },
        },
      ]),

      // Telemetry statistics
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
            devicesWithTelemetry: [
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
            topEventTypes: [
              {
                $match: {
                  occurredAt: { $gte: startDate },
                },
              },
              {
                $group: {
                  _id: "$eventType",
                  count: { $sum: 1 },
                  devices: { $addToSet: "$deviceGuid" },
                },
              },
              {
                $addFields: {
                  deviceCount: { $size: "$devices" },
                },
              },
              {
                $project: {
                  eventType: "$_id",
                  count: 1,
                  deviceCount: 1,
                  _id: 0,
                },
              },
              { $sort: { count: -1 } },
              { $limit: 10 },
            ],
          },
        },
      ]),

      // Filter options
      Device.aggregate([
        {
          $facet: {
            operatingSystems: [
              {
                $group: { _id: "$os" },
              },
              {
                $match: { _id: { $ne: null } },
              },
              { $sort: { _id: 1 } },
            ],
            statusCounts: [
              {
                $group: {
                  _id: "$status",
                  count: { $sum: 1 },
                },
              },
              { $sort: { _id: 1 } },
            ],
          },
        },
      ]),
    ]);

    // Process results
    const overview = {
      total: overviewStats[0].total[0]?.count || 0,
      active: overviewStats[0].active[0]?.count || 0,
      inactive: overviewStats[0].inactive[0]?.count || 0,
      recentlyActive: overviewStats[0].recentlyActive[0]?.count || 0,
    };

    // Calculate percentages for OS distribution
    const totalDevices = overview.total;
    const osDist = osDistribution.map((item) => ({
      os: item._id || "Unknown",
      count: item.count,
      percentage: totalDevices > 0 ? (item.count / totalDevices) * 100 : 0,
    }));

    // Process activity trends
    const trends = activityTrends[0];
    const newDevicesMap = new Map(
      trends.newDevices.map((item: any) => [item._id, item.count])
    );
    const activeDevicesMap = new Map(
      trends.activeDevices.map((item: any) => [item._id, item.count])
    );

    // Generate date range for consistent time series
    const dateRange: string[] = [];
    let currentDate = new Date(startDate);
    while (currentDate <= now) {
      dateRange.push(currentDate.toISOString().substring(0, 10));
      currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
    }

    const activityTrendsData: { date: string; activeDevices: number; newDevices: number }[] =
      dateRange.map((date) => ({
        date,
        activeDevices: (activeDevicesMap.get(date) as number) || 0,
        newDevices: (newDevicesMap.get(date) as number) || 0,
      }));

    // Process telemetry stats
    const telemetryData = telemetryStats[0];
    const totalEvents = telemetryData.totalEvents[0]?.count || 0;
    const devicesWithTelemetry =
      telemetryData.devicesWithTelemetry[0]?.count || 0;
    const averageEventsPerDevice =
      devicesWithTelemetry > 0 ? totalEvents / devicesWithTelemetry : 0;

    // Process filter options
    const filterOpts = filterOptions[0];
    const statusOptions = [
      {
        value: "active",
        label: "Active",
        count:
          filterOpts.statusCounts.find((s: any) => s._id === "active")?.count ||
          0,
      },
      {
        value: "inactive",
        label: "Inactive",
        count:
          filterOpts.statusCounts.find((s: any) => s._id === "inactive")
            ?.count || 0,
      },
    ];

    const stats: DeviceStats = {
      overview,
      osDistribution: osDist,
      activityTrends: activityTrendsData,
      telemetryStats: {
        totalEvents,
        devicesWithTelemetry,
        averageEventsPerDevice: Math.round(averageEventsPerDevice * 100) / 100,
        topEventTypes: telemetryData.topEventTypes,
      },
      filterOptions: {
        operatingSystems: filterOpts.operatingSystems
          .map((os: any) => os._id)
          .filter(Boolean),
        statusOptions,
      },
    };

    return NextResponse.json({
      success: true,
      data: stats,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching device statistics:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch device statistics",
        error:
          process.env.NODE_ENV === "development"
            ? (error instanceof Error ? error.message : String(error))
            : undefined,
      },
      { status: 500 }
    );
  }
}
