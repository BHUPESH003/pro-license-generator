import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import License from "@/models/License";
import TelemetryEvent from "@/models/TelemetryEvent";
import User from "@/models/User";
import { withAdminAuth } from "@/lib/adminAuth";

async function handleGet(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const reportType = searchParams.get("type");
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    if (!reportType) {
      return NextResponse.json(
        { success: false, message: "Report type is required" },
        { status: 400 }
      );
    }

    // Default date range
    const to = toParam ? new Date(toParam) : new Date();
    const from = fromParam
      ? new Date(fromParam)
      : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

    let csvContent = "";
    let filename = "";

    switch (reportType) {
      case "plan-mix":
        const planMixResult = await exportPlanMixData(from, to);
        csvContent = planMixResult.csv;
        filename = planMixResult.filename;
        break;

      case "active-devices":
        const activeDevicesResult = await exportActiveDevicesData(from, to);
        csvContent = activeDevicesResult.csv;
        filename = activeDevicesResult.filename;
        break;

      case "licenses":
        const licensesResult = await exportLicensesData(from, to);
        csvContent = licensesResult.csv;
        filename = licensesResult.filename;
        break;

      case "revenue":
        const revenueResult = await exportRevenueData(from, to);
        csvContent = revenueResult.csv;
        filename = revenueResult.filename;
        break;

      default:
        return NextResponse.json(
          { success: false, message: "Invalid report type" },
          { status: 400 }
        );
    }

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=${filename}`,
      },
    });
  } catch (error) {
    console.error("Error exporting report:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to export report",
        error:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      },
      { status: 500 }
    );
  }
}

async function exportPlanMixData(from: Date, to: Date) {
  const pipeline = [
    {
      $match: {
        purchaseDate: { $gte: from, $lte: to },
        status: "active",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
        pipeline: [{ $project: { email: 1, name: 1 } }],
      },
    },
    {
      $addFields: {
        user: { $arrayElemAt: ["$user", 0] },
      },
    },
    {
      $project: {
        licenseKey: 1,
        plan: 1,
        planType: 1,
        mode: 1,
        status: 1,
        purchaseDate: 1,
        expiryDate: 1,
        userEmail: "$user.email",
        userName: "$user.name",
        stripeCustomerId: 1,
        stripeSubscriptionId: 1,
      },
    },
    { $sort: { purchaseDate: -1 } },
  ];

  const licenses = await License.aggregate(pipeline as any);

  const headers = [
    "License Key",
    "Plan",
    "Plan Type",
    "Mode",
    "Status",
    "Purchase Date",
    "Expiry Date",
    "User Email",
    "User Name",
    "Stripe Customer ID",
    "Stripe Subscription ID",
  ];

  const csvRows = licenses.map((license) => [
    license.licenseKey || "",
    license.plan || "",
    license.planType || "",
    license.mode || "",
    license.status || "",
    license.purchaseDate ? new Date(license.purchaseDate).toISOString() : "",
    license.expiryDate ? new Date(license.expiryDate).toISOString() : "",
    license.userEmail || "",
    license.userName || "",
    license.stripeCustomerId || "",
    license.stripeSubscriptionId || "",
  ]);

  const csv = [
    headers.join(","),
    ...csvRows.map((row) =>
      row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  return {
    csv,
    filename: `plan-mix-export-${new Date().toISOString().split("T")[0]}.csv`,
  };
}

async function exportActiveDevicesData(from: Date, to: Date) {
  // Get daily active device metrics
  const pipeline = [
    {
      $match: {
        occurredAt: { $gte: from, $lte: to },
      },
    },
    {
      $group: {
        _id: {
          date: { $dateTrunc: { date: "$occurredAt", unit: "day" } },
          deviceGuid: "$deviceGuid",
          userId: "$userId",
        },
        eventCount: { $sum: 1 },
        firstEvent: { $min: "$occurredAt" },
        lastEvent: { $max: "$occurredAt" },
      },
    },
    {
      $group: {
        _id: "$_id.date",
        uniqueDevices: { $addToSet: "$_id.deviceGuid" },
        uniqueUsers: { $addToSet: "$_id.userId" },
        totalEvents: { $sum: "$eventCount" },
      },
    },
    {
      $project: {
        date: "$_id",
        deviceCount: { $size: "$uniqueDevices" },
        userCount: { $size: "$uniqueUsers" },
        totalEvents: 1,
      },
    },
    { $sort: { date: 1 } },
  ];

  const dailyMetrics = await TelemetryEvent.aggregate(pipeline as any);

  const headers = ["Date", "Active Devices", "Active Users", "Total Events"];

  const csvRows = dailyMetrics.map((metric) => [
    new Date(metric.date).toISOString().split("T")[0],
    metric.deviceCount.toString(),
    metric.userCount.toString(),
    metric.totalEvents.toString(),
  ]);

  const csv = [
    headers.join(","),
    ...csvRows.map((row) =>
      row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  return {
    csv,
    filename: `active-devices-export-${
      new Date().toISOString().split("T")[0]
    }.csv`,
  };
}

async function exportLicensesData(from: Date, to: Date) {
  const pipeline = [
    {
      $match: {
        purchaseDate: { $gte: from, $lte: to },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
        pipeline: [
          {
            $project: {
              email: 1,
              name: 1,
              phone: 1,
              address: 1,
              stripeCustomerId: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        user: { $arrayElemAt: ["$user", 0] },
      },
    },
    { $sort: { purchaseDate: -1 } },
  ];

  const licenses = await License.aggregate(pipeline as any);

  const headers = [
    "License Key",
    "Plan",
    "Plan Type",
    "Mode",
    "Status",
    "Purchase Date",
    "Expiry Date",
    "Device ID",
    "User Email",
    "User Name",
    "User Phone",
    "User Address",
    "Stripe Customer ID",
    "Stripe Subscription ID",
  ];

  const csvRows = licenses.map((license) => [
    license.licenseKey || "",
    license.plan || "",
    license.planType || "",
    license.mode || "",
    license.status || "",
    license.purchaseDate ? new Date(license.purchaseDate).toISOString() : "",
    license.expiryDate ? new Date(license.expiryDate).toISOString() : "",
    license.deviceId || "",
    license.user?.email || "",
    license.user?.name || "",
    license.user?.phone || "",
    license.user?.address
      ? JSON.stringify(license.user.address).replace(/"/g, '""')
      : "",
    license.user?.stripeCustomerId || license.stripeCustomerId || "",
    license.stripeSubscriptionId || "",
  ]);

  const csv = [
    headers.join(","),
    ...csvRows.map((row) =>
      row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  return {
    csv,
    filename: `licenses-export-${new Date().toISOString().split("T")[0]}.csv`,
  };
}

async function exportRevenueData(from: Date, to: Date) {
  // This would integrate with Stripe data
  // For now, we'll export license-based revenue estimates
  const pipeline = [
    {
      $match: {
        purchaseDate: { $gte: from, $lte: to },
        status: "active",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
        pipeline: [{ $project: { email: 1, name: 1 } }],
      },
    },
    {
      $addFields: {
        user: { $arrayElemAt: ["$user", 0] },
        // Estimate revenue based on plan (this should be replaced with actual Stripe data)
        estimatedRevenue: {
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
    { $sort: { purchaseDate: -1 } },
  ];

  const revenueData = await License.aggregate(pipeline as any);

  const headers = [
    "License Key",
    "Plan",
    "Purchase Date",
    "User Email",
    "Estimated Revenue",
    "Stripe Customer ID",
    "Stripe Subscription ID",
    "Status",
  ];

  const csvRows = revenueData.map((item) => [
    item.licenseKey || "",
    item.plan || "",
    item.purchaseDate ? new Date(item.purchaseDate).toISOString() : "",
    item.user?.email || "",
    item.estimatedRevenue?.toFixed(2) || "0.00",
    item.stripeCustomerId || "",
    item.stripeSubscriptionId || "",
    item.status || "",
  ]);

  const csv = [
    headers.join(","),
    ...csvRows.map((row) =>
      row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  return {
    csv,
    filename: `revenue-export-${new Date().toISOString().split("T")[0]}.csv`,
  };
}

export const GET = withAdminAuth(handleGet);
