import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import TelemetryEvent from "@/models/TelemetryEvent";
import User from "@/models/User";
import License from "@/models/License";
import { withAdminAuth } from "@/lib/adminAuth";

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

interface TelemetryDeviceStats {
  totalDevices: number;
  activeDevices: number;
  topDevices: Array<{
    deviceGuid: string;
    eventCount: number;
    lastActivity: Date;
  }>;
}

interface TelemetryUserStats {
  totalUsers: number;
  activeUsers: number;
  topUsers: Array<{
    userId: string;
    email: string;
    eventCount: number;
    lastActivity: Date;
  }>;
}

interface TelemetrySummaryResponse {
  success: boolean;
  data: {
    volumeOverTime: TelemetryVolumeData[];
    eventTypeStats: TelemetryEventTypeStats[];
    deviceStats: TelemetryDeviceStats;
    userStats: TelemetryUserStats;
    totalEvents: number;
    dateRange: {
      from: Date;
      to: Date;
    };
  };
}

async function handleGet(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);

    // Parse date range parameters
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    const granularity = searchParams.get("granularity") || "day"; // day, hour, week

    // Default to last 30 days if no range specified
    const to = toParam ? new Date(toParam) : new Date();
    const from = fromParam
      ? new Date(fromParam)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Build base filter query
    const baseFilter: any = {
      occurredAt: { $gte: from, $lte: to },
    };

    // Apply additional filters if provided
    const deviceGuidFilter = searchParams.get("filter_deviceGuid");
    if (deviceGuidFilter) {
      baseFilter.deviceGuid = { $regex: deviceGuidFilter, $options: "i" };
    }

    const licenseKeyFilter = searchParams.get("filter_licenseKey");
    if (licenseKeyFilter) {
      const licenses = await License.find(
        { licenseKey: { $regex: licenseKeyFilter, $options: "i" } },
        { _id: 1 }
      );
      const licenseIds = licenses.map((l) => (l._id as any).toString());
      if (licenseIds.length > 0) {
        baseFilter.licenseId = { $in: licenseIds };
      }
    }

    const userEmailFilter = searchParams.get("filter_userEmail");
    if (userEmailFilter) {
      const users = await User.find(
        { email: { $regex: userEmailFilter, $options: "i" } },
        { _id: 1 }
      );
      const userIds = users.map((u) => (u._id as any).toString());
      if (userIds.length > 0) {
        baseFilter.userId = { $in: userIds };
      }
    }

    const eventTypeFilter = searchParams.get("filter_eventType");
    if (eventTypeFilter) {
      baseFilter.eventType = { $regex: eventTypeFilter, $options: "i" };
    }

    // Determine date truncation unit based on granularity
    let dateUnit: string;
    switch (granularity) {
      case "hour":
        dateUnit = "hour";
        break;
      case "week":
        dateUnit = "week";
        break;
      default:
        dateUnit = "day";
    }

    // 1. Volume over time aggregation
    const volumeAggregation = [
      { $match: baseFilter },
      {
        $group: {
          _id: {
            date: { $dateTrunc: { date: "$occurredAt", unit: dateUnit } },
            eventType: "$eventType",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          totalCount: { $sum: "$count" },
          eventTypes: {
            $push: {
              eventType: "$_id.eventType",
              count: "$count",
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const volumeData = await TelemetryEvent.aggregate(volumeAggregation as any);

    // 2. Event type statistics
    const eventTypeAggregation = [
      { $match: baseFilter },
      {
        $group: {
          _id: "$eventType",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 as any } },
    ];

    const eventTypeData = await TelemetryEvent.aggregate(
      eventTypeAggregation as any
    );
    const totalEvents = eventTypeData.reduce(
      (sum, item) => sum + item.count,
      0
    );

    // 3. Device statistics
    const deviceStatsAggregation = [
      { $match: baseFilter },
      {
        $group: {
          _id: "$deviceGuid",
          eventCount: { $sum: 1 },
          lastActivity: { $max: "$occurredAt" },
        },
      },
      { $sort: { eventCount: -1 } },
    ];

    const deviceData = await TelemetryEvent.aggregate(
      deviceStatsAggregation as any
    );

    // 4. User statistics
    const userStatsAggregation = [
      { $match: baseFilter },
      {
        $group: {
          _id: "$userId",
          eventCount: { $sum: 1 },
          lastActivity: { $max: "$occurredAt" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
          pipeline: [{ $project: { email: 1 } }],
        },
      },
      {
        $addFields: {
          user: { $arrayElemAt: ["$user", 0] },
        },
      },
      { $sort: { eventCount: -1 } },
    ];

    const userData = await TelemetryEvent.aggregate(
      userStatsAggregation as any
    );

    // Format volume data
    const formattedVolumeData: TelemetryVolumeData[] = volumeData.map(
      (item) => {
        const eventTypesMap: Record<string, number> = {};
        item.eventTypes.forEach((et: any) => {
          eventTypesMap[et.eventType] = et.count;
        });

        return {
          date: item._id.toISOString().split("T")[0],
          count: item.totalCount,
          eventTypes: eventTypesMap,
        };
      }
    );

    // Format event type stats
    const eventTypeStats: TelemetryEventTypeStats[] = eventTypeData.map(
      (item) => ({
        eventType: item._id,
        count: item.count,
        percentage:
          totalEvents > 0 ? Math.round((item.count / totalEvents) * 100) : 0,
      })
    );

    // Format device stats
    const deviceStats: TelemetryDeviceStats = {
      totalDevices: deviceData.length,
      activeDevices: deviceData.filter(
        (d) =>
          new Date(d.lastActivity) >
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length,
      topDevices: deviceData.slice(0, 10).map((item) => ({
        deviceGuid: item._id,
        eventCount: item.eventCount,
        lastActivity: item.lastActivity,
      })),
    };

    // Format user stats
    const userStats: TelemetryUserStats = {
      totalUsers: userData.length,
      activeUsers: userData.filter(
        (u) =>
          new Date(u.lastActivity) >
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length,
      topUsers: userData.slice(0, 10).map((item) => ({
        userId: item._id.toString(),
        email: item.user?.email || "Unknown",
        eventCount: item.eventCount,
        lastActivity: item.lastActivity,
      })),
    };

    const response: TelemetrySummaryResponse = {
      success: true,
      data: {
        volumeOverTime: formattedVolumeData,
        eventTypeStats,
        deviceStats,
        userStats,
        totalEvents,
        dateRange: {
          from,
          to,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching telemetry summary:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch telemetry summary",
        error:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(handleGet);
