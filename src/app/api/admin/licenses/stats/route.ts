import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import License from "@/models/License";
import User from "@/models/User";

interface LicenseStats {
  overview: {
    total: number;
    active: number;
    inactive: number;
    expiringSoon: number; // Expiring within 30 days
  };
  planDistribution: Array<{
    plan: string;
    count: number;
    percentage: number;
  }>;
  modeDistribution: Array<{
    mode: string;
    count: number;
    percentage: number;
  }>;
  planTypeDistribution: Array<{
    planType: string;
    count: number;
    percentage: number;
  }>;
  filterOptions: {
    plans: string[];
    modes: string[];
    planTypes: string[];
    statusOptions: Array<{
      value: string;
      label: string;
      count: number;
    }>;
  };
  trends: {
    recentCreations: Array<{
      date: string;
      count: number;
    }>;
    expirations: Array<{
      date: string;
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
    const expirySoonDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    // Parallel aggregation queries
    const [
      overviewStats,
      planDistribution,
      modeDistribution,
      planTypeDistribution,
      filterOptions,
      recentCreations,
      upcomingExpirations,
    ] = await Promise.all([
      // Overview statistics
      License.aggregate([
        {
          $facet: {
            total: [{ $count: "count" }],
            active: [{ $match: { status: "active" } }, { $count: "count" }],
            inactive: [{ $match: { status: "inactive" } }, { $count: "count" }],
            expiringSoon: [
              {
                $match: {
                  status: "active",
                  expiryDate: {
                    $gte: now,
                    $lte: expirySoonDate,
                  },
                },
              },
              { $count: "count" },
            ],
          },
        },
      ]),

      // Plan distribution
      License.aggregate([
        {
          $group: {
            _id: "$plan",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),

      // Mode distribution
      License.aggregate([
        {
          $match: { mode: { $exists: true, $ne: null } },
        },
        {
          $group: {
            _id: "$mode",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),

      // Plan type distribution
      License.aggregate([
        {
          $match: { planType: { $exists: true, $ne: null } },
        },
        {
          $group: {
            _id: "$planType",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),

      // Filter options
      License.aggregate([
        {
          $facet: {
            plans: [
              {
                $group: { _id: "$plan" },
              },
              {
                $match: { _id: { $ne: null } },
              },
              { $sort: { _id: 1 } },
            ],
            modes: [
              {
                $match: { mode: { $exists: true, $ne: null } },
              },
              {
                $group: { _id: "$mode" },
              },
              { $sort: { _id: 1 } },
            ],
            planTypes: [
              {
                $match: { planType: { $exists: true, $ne: null } },
              },
              {
                $group: { _id: "$planType" },
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

      // Recent creations (last 30 days, grouped by day)
      License.aggregate([
        {
          $match: {
            purchaseDate: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$purchaseDate",
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Upcoming expirations (next 90 days, grouped by day)
      License.aggregate([
        {
          $match: {
            status: "active",
            expiryDate: {
              $gte: now,
              $lte: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$expiryDate",
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Process results
    const overview = {
      total: overviewStats[0].total[0]?.count || 0,
      active: overviewStats[0].active[0]?.count || 0,
      inactive: overviewStats[0].inactive[0]?.count || 0,
      expiringSoon: overviewStats[0].expiringSoon[0]?.count || 0,
    };

    // Calculate percentages for distributions
    const totalLicenses = overview.total;

    const planDist = planDistribution.map((item) => ({
      plan: item._id || "Unknown",
      count: item.count,
      percentage: totalLicenses > 0 ? (item.count / totalLicenses) * 100 : 0,
    }));

    const modeDist = modeDistribution.map((item) => ({
      mode: item._id || "Unknown",
      count: item.count,
      percentage: totalLicenses > 0 ? (item.count / totalLicenses) * 100 : 0,
    }));

    const planTypeDist = planTypeDistribution.map((item) => ({
      planType: item._id || "Unknown",
      count: item.count,
      percentage: totalLicenses > 0 ? (item.count / totalLicenses) * 100 : 0,
    }));

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

    const stats: LicenseStats = {
      overview,
      planDistribution: planDist,
      modeDistribution: modeDist,
      planTypeDistribution: planTypeDist,
      filterOptions: {
        plans: filterOpts.plans.map((p: any) => p._id).filter(Boolean),
        modes: filterOpts.modes.map((m: any) => m._id).filter(Boolean),
        planTypes: filterOpts.planTypes
          .map((pt: any) => pt._id)
          .filter(Boolean),
        statusOptions,
      },
      trends: {
        recentCreations: recentCreations.map((item) => ({
          date: item._id,
          count: item.count,
        })),
        expirations: upcomingExpirations.map((item) => ({
          date: item._id,
          count: item.count,
        })),
      },
    };

    return NextResponse.json({
      success: true,
      data: stats,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching license statistics:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch license statistics",
        error:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      { status: 500 }
    );
  }
}
