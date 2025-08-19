import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import TelemetryEvent from "@/models/TelemetryEvent";
import { withAdminAuth } from "@/lib/adminAuth";

interface ActiveDeviceMetrics {
  date: string;
  dau: number; // Daily Active Users
  wau: number; // Weekly Active Users
  mau: number; // Monthly Active Users
  dauDevices: number; // Daily Active Devices
  wauDevices: number; // Weekly Active Devices
  mauDevices: number; // Monthly Active Devices
}

interface ActiveDevicesResponse {
  success: boolean;
  data: {
    metrics: ActiveDeviceMetrics[];
    summary: {
      currentDAU: number;
      currentWAU: number;
      currentMAU: number;
      currentDAUDevices: number;
      currentWAUDevices: number;
      currentMAUDevices: number;
      dauGrowth: number;
      wauGrowth: number;
      mauGrowth: number;
    };
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

    // Default to last 30 days if no range specified
    const to = toParam ? new Date(toParam) : new Date();
    const from = fromParam
      ? new Date(fromParam)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Generate date range for daily metrics
    const dateRange: Date[] = [];
    const currentDate = new Date(from);
    while (currentDate <= to) {
      dateRange.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate metrics for each day
    const metricsPromises = dateRange.map(async (date) => {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);

      const monthStart = new Date(date);
      monthStart.setDate(monthStart.getDate() - 29);
      monthStart.setHours(0, 0, 0, 0);

      // DAU - Daily Active Users and Devices
      const dauAggregation = [
        {
          $match: {
            occurredAt: { $gte: dayStart, $lte: dayEnd },
          },
        },
        {
          $group: {
            _id: null,
            uniqueUsers: { $addToSet: "$userId" },
            uniqueDevices: { $addToSet: "$deviceGuid" },
          },
        },
        {
          $project: {
            userCount: { $size: "$uniqueUsers" },
            deviceCount: { $size: "$uniqueDevices" },
          },
        },
      ];

      // WAU - Weekly Active Users and Devices
      const wauAggregation = [
        {
          $match: {
            occurredAt: { $gte: weekStart, $lte: dayEnd },
          },
        },
        {
          $group: {
            _id: null,
            uniqueUsers: { $addToSet: "$userId" },
            uniqueDevices: { $addToSet: "$deviceGuid" },
          },
        },
        {
          $project: {
            userCount: { $size: "$uniqueUsers" },
            deviceCount: { $size: "$uniqueDevices" },
          },
        },
      ];

      // MAU - Monthly Active Users and Devices
      const mauAggregation = [
        {
          $match: {
            occurredAt: { $gte: monthStart, $lte: dayEnd },
          },
        },
        {
          $group: {
            _id: null,
            uniqueUsers: { $addToSet: "$userId" },
            uniqueDevices: { $addToSet: "$deviceGuid" },
          },
        },
        {
          $project: {
            userCount: { $size: "$uniqueUsers" },
            deviceCount: { $size: "$uniqueDevices" },
          },
        },
      ];

      const [dauResult, wauResult, mauResult] = await Promise.all([
        TelemetryEvent.aggregate(dauAggregation as any),
        TelemetryEvent.aggregate(wauAggregation as any),
        TelemetryEvent.aggregate(mauAggregation as any),
      ]);

      return {
        date: date.toISOString().split("T")[0],
        dau: dauResult[0]?.userCount || 0,
        wau: wauResult[0]?.userCount || 0,
        mau: mauResult[0]?.userCount || 0,
        dauDevices: dauResult[0]?.deviceCount || 0,
        wauDevices: wauResult[0]?.deviceCount || 0,
        mauDevices: mauResult[0]?.deviceCount || 0,
      };
    });

    const metrics = await Promise.all(metricsPromises);

    // Calculate growth rates (comparing current vs previous period)
    const currentMetrics = metrics[metrics.length - 1];
    const previousMetrics = metrics[metrics.length - 2];

    const calculateGrowth = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const summary = {
      currentDAU: currentMetrics?.dau || 0,
      currentWAU: currentMetrics?.wau || 0,
      currentMAU: currentMetrics?.mau || 0,
      currentDAUDevices: currentMetrics?.dauDevices || 0,
      currentWAUDevices: currentMetrics?.wauDevices || 0,
      currentMAUDevices: currentMetrics?.mauDevices || 0,
      dauGrowth: previousMetrics
        ? calculateGrowth(currentMetrics?.dau || 0, previousMetrics.dau)
        : 0,
      wauGrowth: previousMetrics
        ? calculateGrowth(currentMetrics?.wau || 0, previousMetrics.wau)
        : 0,
      mauGrowth: previousMetrics
        ? calculateGrowth(currentMetrics?.mau || 0, previousMetrics.mau)
        : 0,
    };

    const response: ActiveDevicesResponse = {
      success: true,
      data: {
        metrics,
        summary,
        dateRange: {
          from,
          to,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching active devices data:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch active devices data",
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
