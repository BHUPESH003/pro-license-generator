import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import License from "@/models/License";
import { withAdminAuth } from "@/lib/adminAuth";
import Stripe from "stripe";

interface FinancialMetrics {
  period: string;
  revenue: number;
  subscriptions: number;
  newCustomers: number;
  churnedCustomers: number;
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
}

interface FinancialSummary {
  totalRevenue: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  currentMRR: number;
  currentARR: number;
  revenueGrowth: number;
  subscriptionGrowth: number;
}

interface FinancialResponse {
  success: boolean;
  data: {
    metrics: FinancialMetrics[];
    summary: FinancialSummary;
    planBreakdown: Array<{
      plan: string;
      revenue: number;
      subscriptions: number;
      percentage: number;
    }>;
    dateRange: {
      from: Date;
      to: Date;
    };
  };
}

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-07-30.basil",
    })
  : null;

async function handleGet(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);

    // Parse date range parameters
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    const includeStripeData = searchParams.get("includeStripe") === "true";

    // Default to last 12 months if no range specified
    const to = toParam ? new Date(toParam) : new Date();
    const from = fromParam
      ? new Date(fromParam)
      : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

    let stripeData: any = null;

    // Fetch Stripe data if available and requested
    if (stripe && includeStripeData) {
      try {
        stripeData = await fetchStripeFinancialData(from, to);
      } catch (error) {
        console.warn("Failed to fetch Stripe data:", error);
        // Continue without Stripe data
      }
    }

    // Fetch license-based financial data
    const licenseFinancialData = await fetchLicenseFinancialData(from, to);

    // Combine Stripe and license data
    const combinedMetrics = combineFinancialData(
      licenseFinancialData,
      stripeData
    );

    // Calculate summary metrics
    const summary = calculateFinancialSummary(combinedMetrics);

    // Plan breakdown
    const planBreakdown = await calculatePlanBreakdown(from, to, stripeData);

    const response: FinancialResponse = {
      success: true,
      data: {
        metrics: combinedMetrics,
        summary,
        planBreakdown,
        dateRange: {
          from,
          to,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching financial data:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch financial data",
        error:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      },
      { status: 500 }
    );
  }
}

async function fetchStripeFinancialData(from: Date, to: Date) {
  if (!stripe) return null;

  const fromTimestamp = Math.floor(from.getTime() / 1000);
  const toTimestamp = Math.floor(to.getTime() / 1000);

  // Fetch charges (revenue)
  const charges = await stripe.charges.list({
    created: {
      gte: fromTimestamp,
      lte: toTimestamp,
    },
    limit: 100,
  });

  // Fetch subscriptions
  const subscriptions = await stripe.subscriptions.list({
    created: {
      gte: fromTimestamp,
      lte: toTimestamp,
    },
    limit: 100,
  });

  // Fetch customers
  const customers = await stripe.customers.list({
    created: {
      gte: fromTimestamp,
      lte: toTimestamp,
    },
    limit: 100,
  });

  return {
    charges: charges.data,
    subscriptions: subscriptions.data,
    customers: customers.data,
  };
}

async function fetchLicenseFinancialData(from: Date, to: Date) {
  const pipeline = [
    {
      $match: {
        purchaseDate: { $gte: from, $lte: to },
      },
    },
    {
      $group: {
        _id: {
          month: {
            $dateToString: {
              format: "%Y-%m",
              date: "$purchaseDate",
            },
          },
          plan: "$plan",
        },
        count: { $sum: 1 },
        // Estimate revenue based on plan
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
    {
      $group: {
        _id: "$_id.month",
        totalRevenue: { $sum: "$estimatedRevenue" },
        totalSubscriptions: { $sum: "$count" },
        planBreakdown: {
          $push: {
            plan: "$_id.plan",
            revenue: "$estimatedRevenue",
            subscriptions: "$count",
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ];

  return await License.aggregate(pipeline as any);
}

function combineFinancialData(
  licenseData: any[],
  stripeData: any
): FinancialMetrics[] {
  const metrics: FinancialMetrics[] = [];

  // Process license data
  licenseData.forEach((item) => {
    const stripeRevenue = stripeData
      ? getStripeRevenueForPeriod(item._id, stripeData)
      : 0;

    metrics.push({
      period: item._id,
      revenue: item.totalRevenue + stripeRevenue,
      subscriptions: item.totalSubscriptions,
      newCustomers: item.totalSubscriptions, // Simplified - should track actual new vs existing
      churnedCustomers: 0, // Would need to calculate from subscription cancellations
      mrr: item.totalRevenue, // Simplified calculation
      arr: item.totalRevenue * 12,
    });
  });

  return metrics.sort((a, b) => a.period.localeCompare(b.period));
}

function getStripeRevenueForPeriod(period: string, stripeData: any): number {
  if (!stripeData?.charges) return 0;

  const [year, month] = period.split("-");
  const periodStart = new Date(parseInt(year), parseInt(month) - 1, 1);
  const periodEnd = new Date(parseInt(year), parseInt(month), 0);

  return stripeData.charges
    .filter((charge: any) => {
      const chargeDate = new Date(charge.created * 1000);
      return chargeDate >= periodStart && chargeDate <= periodEnd;
    })
    .reduce((sum: number, charge: any) => sum + charge.amount / 100, 0);
}

function calculateFinancialSummary(
  metrics: FinancialMetrics[]
): FinancialSummary {
  const totalRevenue = metrics.reduce((sum, m) => sum + m.revenue, 0);
  const totalSubscriptions = metrics.reduce(
    (sum, m) => sum + m.subscriptions,
    0
  );

  const currentPeriod = metrics[metrics.length - 1];
  const previousPeriod = metrics[metrics.length - 2];

  const revenueGrowth = previousPeriod
    ? (((currentPeriod?.revenue || 0) - previousPeriod.revenue) /
        previousPeriod.revenue) *
      100
    : 0;

  const subscriptionGrowth = previousPeriod
    ? (((currentPeriod?.subscriptions || 0) - previousPeriod.subscriptions) /
        previousPeriod.subscriptions) *
      100
    : 0;

  return {
    totalRevenue,
    totalSubscriptions,
    activeSubscriptions: totalSubscriptions, // Simplified
    currentMRR: currentPeriod?.mrr || 0,
    currentARR: currentPeriod?.arr || 0,
    revenueGrowth: Math.round(revenueGrowth * 100) / 100,
    subscriptionGrowth: Math.round(subscriptionGrowth * 100) / 100,
  };
}

async function calculatePlanBreakdown(from: Date, to: Date, stripeData: any) {
  const pipeline = [
    {
      $match: {
        purchaseDate: { $gte: from, $lte: to },
        status: "active",
      },
    },
    {
      $group: {
        _id: "$plan",
        subscriptions: { $sum: 1 },
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
  ];

  const planData = await License.aggregate(pipeline as any);
  const totalRevenue = planData.reduce((sum, p) => sum + p.estimatedRevenue, 0);

  return planData.map((plan) => ({
    plan: plan._id || "Unknown",
    revenue: plan.estimatedRevenue,
    subscriptions: plan.subscriptions,
    percentage:
      totalRevenue > 0
        ? Math.round((plan.estimatedRevenue / totalRevenue) * 100)
        : 0,
  }));
}

export const GET = withAdminAuth(handleGet);
