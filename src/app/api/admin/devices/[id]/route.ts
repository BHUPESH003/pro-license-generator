import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Device from "@/models/Device";
import User from "@/models/User";
import License from "@/models/License";
import TelemetryEvent from "@/models/TelemetryEvent";
import AdminAudit from "@/models/AdminAudit";
import mongoose from "mongoose";

interface DeviceDetail {
  _id: string;
  name: string;
  os: string;
  deviceGuid?: string;
  status: "active" | "inactive";
  lastActivity: Date;
  user: {
    _id: string;
    email: string;
    name?: string;
    phone?: string;
  };
  license: {
    _id: string;
    licenseKey: string;
    status: "active" | "inactive";
    plan: string;
    mode?: "subscription" | "payment";
    planType?: "monthly" | "quarterly" | "yearly";
    expiryDate: Date;
  };
  telemetryEvents: Array<{
    _id: string;
    eventType: string;
    occurredAt: Date;
    appVersion?: string;
    metadata?: Record<string, any>;
  }>;
  activityHistory: Array<{
    _id: string;
    type:
      | "device_created"
      | "device_renamed"
      | "device_activated"
      | "device_deactivated"
      | "admin_action"
      | "telemetry_activity";
    description: string;
    timestamp: Date;
    actor?: {
      _id: string;
      email: string;
      name?: string;
    };
    metadata?: Record<string, any>;
  }>;
  statistics: {
    totalTelemetryEvents: number;
    uniqueEventTypes: number;
    lastTelemetryEvent?: Date;
    daysActive: number;
    averageEventsPerDay: number;
    topEventTypes: Array<{
      eventType: string;
      count: number;
    }>;
  };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const params = await context.params;
    const deviceId = params.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(deviceId)) {
      return NextResponse.json(
        { success: false, message: "Invalid device ID" },
        { status: 400 }
      );
    }

    // Fetch device with user and license details
    const device = await Device.findById(deviceId)
      .populate("userId", "email name phone")
      .populate("licenseId", "licenseKey status plan mode planType expiryDate")
      .lean();

    if (!device) {
      return NextResponse.json(
        { success: false, message: "Device not found" },
        { status: 404 }
      );
    }

    // Fetch telemetry events for this device (last 100)
    const telemetryEvents = await TelemetryEvent.find({
      deviceGuid: device.deviceGuid,
    })
      .select("eventType occurredAt appVersion metadata")
      .sort({ occurredAt: -1 })
      .limit(100)
      .lean();

    // Fetch admin audit logs for this device
    const auditLogs = await AdminAudit.find({
      entityType: "device",
      entityId: deviceId,
    })
      .populate("actorUserId", "email name")
      .sort({ createdAt: -1 })
      .lean();

    // Build activity history from multiple sources
    const activityHistory: DeviceDetail["activityHistory"] = [];

    // Add device creation event
    const deviceCreatedAt: Date = (
      device._id as unknown as mongoose.Types.ObjectId
    ).getTimestamp();
    activityHistory.push({
      _id: `device_created_${device._id}`,
      type: "device_created",
      description: `Device "${device.name}" was registered`,
      timestamp: deviceCreatedAt,
      metadata: {
        deviceName: device.name,
        os: device.os,
        deviceGuid: device.deviceGuid,
      },
    });

    // Add audit log events
    auditLogs.forEach((audit: any) => {
      let description = "";
      let type: DeviceDetail["activityHistory"][0]["type"] = "admin_action";

      switch (audit.action) {
        case "device_renamed":
          description = `Device renamed by admin`;
          type = "device_renamed";
          break;
        case "device_activated":
          description = "Device activated by admin";
          type = "device_activated";
          break;
        case "device_deactivated":
          description = "Device deactivated by admin";
          type = "device_deactivated";
          break;
        case "device_unbound":
          description = "Device unbound from license by admin";
          type = "admin_action";
          break;
        default:
          description = `Admin action: ${audit.action}`;
          type = "admin_action";
      }

      activityHistory.push({
        _id: (audit._id as any).toString(),
        type,
        description,
        timestamp: audit.createdAt,
        actor: audit.actorUserId
          ? {
              _id: (audit.actorUserId._id as any).toString(),
              email: (audit.actorUserId as any).email,
              name: (audit.actorUserId as any).name,
            }
          : undefined,
        metadata: audit.payload,
      });
    });

    // Add telemetry activity summary (group by day)
    const telemetryByDay = new Map<
      string,
      { count: number; eventTypes: Set<string> }
    >();
    telemetryEvents.forEach((event) => {
      const day = event.occurredAt.toISOString().split("T")[0];
      if (!telemetryByDay.has(day)) {
        telemetryByDay.set(day, { count: 0, eventTypes: new Set() });
      }
      const dayData = telemetryByDay.get(day)!;
      dayData.count++;
      dayData.eventTypes.add(event.eventType);
    });

    // Add daily telemetry summaries (last 7 days)
    const recentDays = Array.from(telemetryByDay.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 7);

    recentDays.forEach(([day, data]) => {
      activityHistory.push({
        _id: `telemetry_${day}`,
        type: "telemetry_activity",
        description: `${data.count} telemetry event${
          data.count > 1 ? "s" : ""
        } recorded (${Array.from(data.eventTypes).join(", ")})`,
        timestamp: new Date(day + "T23:59:59Z"),
        metadata: {
          eventCount: data.count,
          eventTypes: Array.from(data.eventTypes),
          date: day,
        },
      });
    });

    // Sort activity history by timestamp (most recent first)
    activityHistory.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Calculate statistics
    const totalTelemetryEvents = telemetryEvents.length;
    const uniqueEventTypes = new Set(telemetryEvents.map((e) => e.eventType))
      .size;
    const lastTelemetryEvent =
      telemetryEvents.length > 0 ? telemetryEvents[0].occurredAt : undefined;
    const daysActive = Math.floor(
      (Date.now() - deviceCreatedAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    const averageEventsPerDay =
      daysActive > 0 ? totalTelemetryEvents / daysActive : 0;

    // Calculate top event types
    const eventTypeCounts = new Map<string, number>();
    telemetryEvents.forEach((event) => {
      eventTypeCounts.set(
        event.eventType,
        (eventTypeCounts.get(event.eventType) || 0) + 1
      );
    });

    const topEventTypes = Array.from(eventTypeCounts.entries())
      .map(([eventType, count]) => ({ eventType, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const userPopulated: any = device.userId as any;
    const licensePopulated: any = device.licenseId as any;

    const deviceDetail: DeviceDetail = {
      _id: device._id.toString(),
      name: device.name,
      os: device.os,
      deviceGuid: device.deviceGuid,
      status: device.status || "active",
      lastActivity: device.lastActivity,
      user: {
        _id: (userPopulated?._id as any)?.toString?.() || String(device.userId),
        email: userPopulated?.email,
        name: userPopulated?.name,
        phone: userPopulated?.phone,
      },
      license: {
        _id:
          (licensePopulated?._id as any)?.toString?.() ||
          String(device.licenseId),
        licenseKey: licensePopulated?.licenseKey,
        status: licensePopulated?.status,
        plan: licensePopulated?.plan,
        mode: licensePopulated?.mode,
        planType: licensePopulated?.planType,
        expiryDate: licensePopulated?.expiryDate,
      },
      telemetryEvents: telemetryEvents.map((event: any) => ({
        _id: (event._id as any).toString(),
        eventType: event.eventType,
        occurredAt: event.occurredAt,
        appVersion: event.appVersion,
        metadata: event.metadata,
      })),
      activityHistory: activityHistory.slice(0, 50), // Limit to 50 most recent events
      statistics: {
        totalTelemetryEvents,
        uniqueEventTypes,
        lastTelemetryEvent,
        daysActive,
        averageEventsPerDay: Math.round(averageEventsPerDay * 100) / 100,
        topEventTypes,
      },
    };

    return NextResponse.json({
      success: true,
      data: deviceDetail,
    });
  } catch (error) {
    console.error("Error fetching device details:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch device details",
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
