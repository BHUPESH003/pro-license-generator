import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import License from "@/models/License";
import { withAdminAuth } from "@/lib/adminAuth";

interface PlanMixDataPoint {
  month: string;
  plans: Record<string, number>;
  total: number;
}

interface PlanMixResponse {
  success: boolean;
  data: {
    planMixData: PlanMixDataPoint[];
    planSummary: Array<{
      plan: string;
      count: number;
      percentage: number;
      revenue?: number;
    }>;
    totalLicenses: number;
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
    const granularity = searchParams.get("granularity") || "month"; // month, quarter, year

    // Default to last 12 months if no range specified
    const to = toParam ? new Date(toParam) : new Date();
    const from = fromParam
      ? new Date(fromParam)
      : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

    // Build base filter query
    const baseFilter: any = {
      purchaseDate: { $gte: from, $lte: to },
      status: "active", // Only include active licenses
    };

    // Determine date truncation unit based on granularity
    let dateUnit: string;
    let dateFormat: string;
    switch (granularity) {
      case "quarter":
        dateUnit = "quarter";
        dateFormat = "%Y-Q%q";
        break;
      case "year":
        dateUnit = "year";
        dateFormat = "%Y";
        break;
      default:
        dateUnit = "month";
        dateFormat = "%Y-%m";
    }

    // 1. Plan mix over time aggregation
    const planMixAggregation = [
      { $match: baseFilter },
      {
        $group: {
          _id: {
            period: {
              $dateToString: {
                format: dateFormat,
                date: "$purchaseDate",
              },
            },
            plan: "$plan",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.period",
          plans: {
            $push: {
              plan: "$_id.plan",
              count: "$count",
            },
          },
          total: { $sum: "$count" },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const planMixData = await License.aggregate(planMixAggregation as any);

    // 2. Overall plan summary
    const planSummaryAggregation = [
      { $match: baseFilter },
      {
        $group: {
          _id: "$plan",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ];

    const planSummaryData = await License.aggregate(
      planSummaryAggregation as any
    );
    const totalLicenses = planSummaryData.reduce(
      (sum, item) => sum + item.count,
      0
    );

    // Format plan mix data
    const formattedPlanMixData: PlanMixDataPoint[] = planMixData.map((item) => {
      const plansMap: Record<string, number> = {};
      item.plans.forEach((planData: any) => {
        plansMap[planData.plan || "Unknown"] = planData.count;
      });

      return {
        month: item._id,
        plans: plansMap,
        total: item.total,
      };
    });

    // Format plan summary
    const planSummary = planSummaryData.map((item) => ({
      plan: item._id || "Unknown",
      count: item.count,
      percentage:
        totalLicenses > 0 ? Math.round((item.count / totalLicenses) * 100) : 0,
    }));

    const response: PlanMixResponse = {
      success: true,
      data: {
        planMixData: formattedPlanMixData,
        planSummary,
        totalLicenses,
        dateRange: {
          from,
          to,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching plan mix data:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch plan mix data",
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
