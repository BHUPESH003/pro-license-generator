import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/adminAuth";
import dbConnect from "@/lib/db";
import User from "@/models/User";

async function getUserStatsHandler(request: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  try {
    // Build date range filter
    const dateFilter: any = {};
    if (from) {
      dateFilter.$gte = new Date(from);
    }
    if (to) {
      dateFilter.$lte = new Date(to);
    }

    // Build aggregation pipeline
    const pipeline: any[] = [
      {
        $facet: {
          totalUsers: [{ $count: "count" }],
          newUsers:
            dateFilter.$gte || dateFilter.$lte
              ? [
                  {
                    $match: {
                      createdAt: dateFilter,
                    },
                  },
                  { $count: "count" },
                ]
              : [{ $match: { _id: null } }, { $count: "count" }],
          usersByRole: [
            {
              $group: {
                _id: { $ifNull: ["$role", "user"] },
                count: { $sum: 1 },
              },
            },
          ],
          activeUsers: [
            {
              $match: {
                lastSeenAt: {
                  $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                },
              },
            },
            { $count: "count" },
          ],
          userRegistrationTrend: [
            {
              $match: dateFilter.$gte
                ? { createdAt: { $gte: dateFilter.$gte } }
                : {},
            },
            {
              $group: {
                _id: {
                  $dateTrunc: {
                    date: "$createdAt",
                    unit: "day",
                  },
                },
                count: { $sum: 1 },
              },
            },
            {
              $sort: { _id: 1 as 1 },
            },
            {
              $project: {
                date: "$_id",
                count: 1,
                _id: 0,
              },
            },
          ],
        },
      },
    ];

    const [result] = await User.aggregate(pipeline);

    // Process results
    const stats = {
      totalUsers: result.totalUsers[0]?.count || 0,
      newUsers: result.newUsers[0]?.count || 0,
      activeUsers: result.activeUsers[0]?.count || 0,
      usersByRole: result.usersByRole.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      registrationTrend: result.userRegistrationTrend || [],
    };

    // Ensure we have admin and user counts
    if (!stats.usersByRole.admin) stats.usersByRole.admin = 0;
    if (!stats.usersByRole.user) stats.usersByRole.user = 0;

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch user statistics",
        code: "OPERATION_FAILED",
      },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(getUserStatsHandler);
