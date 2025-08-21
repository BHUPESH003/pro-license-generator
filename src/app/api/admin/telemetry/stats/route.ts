import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import TelemetryEvent from "@/models/TelemetryEvent";
import { withAdminAuth } from "@/lib/adminAuth";

interface TelemetryStatsResponse {
  success: boolean;
  data: {
    totalEvents: number;
    eventsToday: number;
    eventsThisWeek: number;
    eventsThisMonth: number;
    uniqueDevicesToday: number;
    uniqueDevicesThisWeek: number;
    uniqueDevicesThisMonth: number;
    uniqueUsersToday: number;
    uniqueUsersThisWeek: number;
    uniqueUsersThisMonth: number;
    topEventTypes: Array<{
      eventType: string;
      count: number;
    }>;
    recentActivity: Array<{
      date: string;
      count: number;
    }>;
  };
}

async function handleGet(req: NextRequest) {
  try {
    await dbConnect();

    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get total events count
    const totalEvents = await TelemetryEvent.countDocuments();

    // Get events for different time periods
    const [eventsToday, eventsThisWeek, eventsThisMonth] = await Promise.all([
      TelemetryEvent.countDocuments({ occurredAt: { $gte: startOfToday } }),
      TelemetryEvent.countDocuments({ occurredAt: { $gte: startOfWeek } }),
      TelemetryEvent.countDocuments({ occurredAt: { $gte: startOfMonth } }),
    ]);

    // Get unique devices for different time periods
    const uniqueDevicesAggregation = [
      {
        $facet: {
          today: [
            { $match: { occurredAt: { $gte: startOfToday } } },
            { $group: { _id: "$deviceGuid" } },
            { $count: "count" },
          ],
          thisWeek: [
            { $match: { occurredAt: { $gte: startOfWeek } } },
            { $group: { _id: "$deviceGuid" } },
            { $count: "count" },
          ],
          thisMonth: [
            { $match: { occurredAt: { $gte: startOfMonth } } },
            { $group: { _id: "$deviceGuid" } },
            { $count: "count" },
          ],
        },
      },
    ];

    const uniqueDevicesResult = await TelemetryEvent.aggregate(
      uniqueDevicesAggregation
    );
    const uniqueDevicesToday = uniqueDevicesResult[0]?.today[0]?.count || 0;
    const uniqueDevicesThisWeek =
      uniqueDevicesResult[0]?.thisWeek[0]?.count || 0;
    const uniqueDevicesThisMonth =
      uniqueDevicesResult[0]?.thisMonth[0]?.count || 0;

    // Get unique users for different time periods
    const uniqueUsersAggregation = [
      {
        $facet: {
          today: [
            { $match: { occurredAt: { $gte: startOfToday } } },
            { $group: { _id: "$userId" } },
            { $count: "count" },
          ],
          thisWeek: [
            { $match: { occurredAt: { $gte: startOfWeek } } },
            { $group: { _id: "$userId" } },
            { $count: "count" },
          ],
          thisMonth: [
            { $match: { occurredAt: { $gte: startOfMonth } } },
            { $group: { _id: "$userId" } },
            { $count: "count" },
          ],
        },
      },
    ];

    const uniqueUsersResult = await TelemetryEvent.aggregate(
      uniqueUsersAggregation
    );
    const uniqueUsersToday = uniqueUsersResult[0]?.today[0]?.count || 0;
    const uniqueUsersThisWeek = uniqueUsersResult[0]?.thisWeek[0]?.count || 0;
    const uniqueUsersThisMonth = uniqueUsersResult[0]?.thisMonth[0]?.count || 0;

    // Get top event types (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const topEventTypesAggregation = [
      { $match: { occurredAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: "$eventType",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ];

    const topEventTypes = await TelemetryEvent.aggregate(
      topEventTypesAggregation as any
    );

    // Get recent activity (last 7 days, daily breakdown)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentActivityAggregation = [
      { $match: { occurredAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateTrunc: { date: "$occurredAt", unit: "day" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const recentActivityData = await TelemetryEvent.aggregate(
      recentActivityAggregation as any
    );

    // Format recent activity data
    const recentActivity = recentActivityData.map((item) => ({
      date: item._id.toISOString().split("T")[0],
      count: item.count,
    }));

    // Format top event types
    const formattedTopEventTypes = topEventTypes.map((item) => ({
      eventType: item._id,
      count: item.count,
    }));

    const response: TelemetryStatsResponse = {
      success: true,
      data: {
        totalEvents,
        eventsToday,
        eventsThisWeek,
        eventsThisMonth,
        uniqueDevicesToday,
        uniqueDevicesThisWeek,
        uniqueDevicesThisMonth,
        uniqueUsersToday,
        uniqueUsersThisWeek,
        uniqueUsersThisMonth,
        topEventTypes: formattedTopEventTypes,
        recentActivity,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching telemetry stats:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch telemetry stats",
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
