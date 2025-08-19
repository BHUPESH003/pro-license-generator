import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import License from "@/models/License";
import TelemetryEvent from "@/models/TelemetryEvent";
import User from "@/models/User";
import { withAdminAuth } from "@/lib/adminAuth";

interface ReportsSummaryResponse {
  success: boolean;
  data: {
    overview: {
      totalUsers: number;
      totalLicenses: number;
      activeLicenses: number;
      totalRevenue: number;
      activeDevices: number;
      totalEvents: number;
    };
    growth: {
      usersGrowth: number;
      licensesGrowth: number;
      revenueGrowth: number;
      eventsGrowth: number;
    };
    planDistribution: Array<{
      plan: string;
      count: number;
      percentage: number;
    }>;
    recentActivity: {
      newUsersToday: number;
      newLicensesToday: number;
      eventsToday: number;
      activeDevicesToday: number;
    };
    topMetrics: {
      topEventTypes: Array<{
        eventType: string;
        count: number;
      }>;
      topPlans: Array<{
        plan: string;
        revenue: number;
      }>;
    };
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
    const startOfYesterday = new Date(
      startOfToday.getTime() - 24 * 60 * 60 * 1000
    );
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Overview metrics
    const [
      totalUsers,
      totalLicenses,
      activeLicenses,
      totalEvents,
      activeDevicesToday,
      newUsersToday,
      newLicensesToday,
      eventsToday,
    ] = await Promise.all([
      User.countDocuments(),
      License.countDocuments(),
      License.countDocuments({ status: "active" }),
      TelemetryEvent.countDocuments(),
      TelemetryEvent.distinct("deviceGuid", {
        occurredAt: { $gte: startOfToday },
      }).then((devices) => devices.length),
      User.countDocuments({
        createdAt: { $gte: startOfToday },
      }),
      License.countDocuments({
        purchaseDate: { $gte: startOfToday },
      }),
      TelemetryEvent.countDocuments({
        occurredAt: { $gte: startOfToday },
      }),
    ]);

    // Growth calculations (comparing last 30 days vs previous 30 days)
    const [
      usersLast30Days,
      usersPrevious30Days,
      licensesLast30Days,
      licensesPrevious30Days,
      eventsLast30Days,
      eventsPrevious30Days,
    ] = await Promise.all([
      User.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
      }),
      User.countDocuments({
        createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
      }),
      License.countDocuments({
        purchaseDate: { $gte: thirtyDaysAgo },
      }),
      License.countDocuments({
        purchaseDate: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
      }),
      TelemetryEvent.countDocuments({
        occurredAt: { $gte: thirtyDaysAgo },
      }),
      TelemetryEvent.countDocuments({
        occurredAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
      }),
    ]);

    const calculateGrowth = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const growth = {
      usersGrowth: calculateGrowth(usersLast30Days, usersPrevious30Days),
      licensesGrowth: calculateGrowth(
        licensesLast30Days,
        licensesPrevious30Days
      ),
      revenueGrowth: 0, // Would need actual revenue data
      eventsGrowth: calculateGrowth(eventsLast30Days, eventsPrevious30Days),
    };

    // Plan distribution
    const planDistributionAggregation = [
      { $match: { status: "active" } },
      {
        $group: {
          _id: "$plan",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ];

    const planDistributionData = await License.aggregate(
      planDistributionAggregation as any
    );
    const totalActiveLicenses = planDistributionData.reduce(
      (sum, item) => sum + item.count,
      0
    );

    const planDistribution = planDistributionData.map((item) => ({
      plan: item._id || "Unknown",
      count: item.count,
      percentage:
        totalActiveLicenses > 0
          ? Math.round((item.count / totalActiveLicenses) * 100)
          : 0,
    }));

    // Top event types (last 30 days)
    const topEventTypesAggregation = [
      { $match: { occurredAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: "$eventType",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ];

    const topEventTypesData = await TelemetryEvent.aggregate(
      topEventTypesAggregation as any
    );

    const topEventTypes = topEventTypesData.map((item) => ({
      eventType: item._id,
      count: item.count,
    }));

    // Top plans by estimated revenue
    const topPlansAggregation = [
      { $match: { status: "active" } },
      {
        $group: {
          _id: "$plan",
          count: { $sum: 1 },
          estimatedRevenue: {
            $sum: {
              $switch: {
                branches: [
                  { case: { $eq: ["$plan", "pro"] }, then: 29.99 },
                  { case: { $eq: ["$plan", "premium"] }, then: 49.99 },
                  { case: { $eq: ["$plan", "enterprise"] }, then: 99.99 },
                ],
                default: 0,
              },
            },
          },
        },
      },
      { $sort: { estimatedRevenue: -1 } },
      { $limit: 5 },
    ];

    const topPlansData = await License.aggregate(topPlansAggregation as any);

    const topPlans = topPlansData.map((item) => ({
      plan: item._id || "Unknown",
      revenue: item.estimatedRevenue,
    }));

    // Calculate total estimated revenue
    const totalRevenue = topPlansData.reduce(
      (sum, item) => sum + item.estimatedRevenue,
      0
    );

    const response: ReportsSummaryResponse = {
      success: true,
      data: {
        overview: {
          totalUsers,
          totalLicenses,
          activeLicenses,
          totalRevenue,
          activeDevices: activeDevicesToday,
          totalEvents,
        },
        growth,
        planDistribution,
        recentActivity: {
          newUsersToday,
          newLicensesToday,
          eventsToday,
          activeDevicesToday,
        },
        topMetrics: {
          topEventTypes,
          topPlans,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching reports summary:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch reports summary",
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
