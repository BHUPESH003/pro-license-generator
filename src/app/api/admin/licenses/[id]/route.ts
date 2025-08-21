import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import License from "@/models/License";
import User from "@/models/User";
import Device from "@/models/Device";
import TelemetryEvent from "@/models/TelemetryEvent";
import AdminAudit from "@/models/AdminAudit";
import mongoose from "mongoose";

interface LicenseDetail {
  _id: string;
  licenseKey: string;
  status: "active" | "inactive";
  plan: string;
  mode?: "subscription" | "payment";
  planType?: "monthly" | "quarterly" | "yearly";
  purchaseDate: Date;
  expiryDate: Date;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  user: {
    _id: string;
    email: string;
    name?: string;
    phone?: string;
  };
  devices: Array<{
    _id: string;
    name: string;
    os: string;
    deviceGuid?: string;
    status: "active" | "inactive";
    lastActivity: Date;
  }>;
  activityTimeline: Array<{
    _id: string;
    type:
      | "license_created"
      | "license_activated"
      | "license_deactivated"
      | "device_added"
      | "device_removed"
      | "admin_action"
      | "telemetry_event";
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
    totalDevices: number;
    activeDevices: number;
    totalEvents: number;
    lastEventDate?: Date;
    daysActive: number;
  };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const params = await context.params;
    const licenseId = params.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(licenseId)) {
      return NextResponse.json(
        { success: false, message: "Invalid license ID" },
        { status: 400 }
      );
    }

    // Fetch license with user details
    const license = await License.findById(licenseId)
      .populate("userId", "email name phone")
      .lean();

    if (!license) {
      return NextResponse.json(
        { success: false, message: "License not found" },
        { status: 404 }
      );
    }

    // Fetch associated devices
    const devices = await Device.find({ licenseId })
      .select("name os deviceGuid status lastActivity")
      .lean();

    // Build activity timeline from multiple sources
    const timelinePromises = [
      // License creation and status changes from audit logs
      AdminAudit.find({
        entityType: "license",
        entityId: licenseId,
      })
        .populate("actorUserId", "email name")
        .sort({ createdAt: -1 })
        .lean(),

      // Recent telemetry events (last 50)
      TelemetryEvent.find({ licenseId })
        .sort({ occurredAt: -1 })
        .limit(50)
        .lean(),
    ];

    const [auditLogs, telemetryEvents] = await Promise.all(timelinePromises);

    // Build activity timeline
    const activityTimeline: LicenseDetail["activityTimeline"] = [];

    // Add license creation event
    const licenseCreatedAt: Date = (
      license._id as unknown as mongoose.Types.ObjectId
    ).getTimestamp();

    activityTimeline.push({
      _id: `license_created_${license._id}`,
      type: "license_created",
      description: `License created for plan: ${license.plan}`,
      timestamp: license.purchaseDate || licenseCreatedAt,
      metadata: {
        plan: license.plan,
        mode: license.mode,
        planType: license.planType,
      },
    });

    // Add audit log events
    auditLogs.forEach((audit: any) => {
      let description = "";
      let type: LicenseDetail["activityTimeline"][0]["type"] = "admin_action";

      switch (audit.action) {
        case "license_activated":
          description = "License activated by admin";
          type = "license_activated";
          break;
        case "license_deactivated":
          description = "License deactivated by admin";
          type = "license_deactivated";
          break;
        case "license_updated":
          description = "License details updated by admin";
          type = "admin_action";
          break;
        default:
          description = `Admin action: ${audit.action}`;
          type = "admin_action";
      }

      activityTimeline.push({
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

    // Add device events (when devices were added/removed)
    devices.forEach((device) => {
      const deviceCreatedAt: Date = (
        device._id as unknown as mongoose.Types.ObjectId
      ).getTimestamp();
      activityTimeline.push({
        _id: `device_added_${device._id}`,
        type: "device_added",
        description: `Device "${device.name}" (${device.os}) connected`,
        timestamp: deviceCreatedAt,
        metadata: {
          deviceId: device._id.toString(),
          deviceName: device.name,
          os: device.os,
          deviceGuid: device.deviceGuid,
        },
      });
    });

    // Add recent telemetry events (summarized)
    const eventTypeCounts: Record<
      string,
      { count: number; lastOccurred: Date }
    > = {};
    telemetryEvents.forEach((event) => {
      if (!eventTypeCounts[event.eventType]) {
        eventTypeCounts[event.eventType] = {
          count: 0,
          lastOccurred: event.occurredAt,
        };
      }
      eventTypeCounts[event.eventType].count++;
      if (event.occurredAt > eventTypeCounts[event.eventType].lastOccurred) {
        eventTypeCounts[event.eventType].lastOccurred = event.occurredAt;
      }
    });

    Object.entries(eventTypeCounts).forEach(([eventType, data]) => {
      activityTimeline.push({
        _id: `telemetry_${eventType}_${data.lastOccurred.getTime()}`,
        type: "telemetry_event",
        description: `${data.count} ${eventType} event${
          data.count > 1 ? "s" : ""
        } recorded`,
        timestamp: data.lastOccurred,
        metadata: {
          eventType,
          count: data.count,
        },
      });
    });

    // Sort timeline by timestamp (most recent first)
    activityTimeline.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Calculate statistics
    const totalEvents = telemetryEvents.length;
    const lastEventDate =
      telemetryEvents.length > 0 ? telemetryEvents[0].occurredAt : undefined;
    const daysActive = Math.floor(
      (Date.now() - (license.purchaseDate || licenseCreatedAt).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const userPopulated: any = license.userId as any;

    const licenseDetail: LicenseDetail = {
      _id: license._id.toString(),
      licenseKey: license.licenseKey,
      status: license.status,
      plan: license.plan,
      mode: license.mode,
      planType: license.planType,
      purchaseDate: license.purchaseDate,
      expiryDate: license.expiryDate,
      stripeSubscriptionId: license.stripeSubscriptionId,
      stripeCustomerId: license.stripeCustomerId,
      user: {
        _id: (userPopulated?._id as any)?.toString?.() || String(license.userId),
        email: userPopulated?.email,
        name: userPopulated?.name,
        phone: userPopulated?.phone,
      },
      devices: devices.map((device) => ({
        _id: device._id.toString(),
        name: device.name,
        os: device.os,
        deviceGuid: device.deviceGuid,
        status: device.status || "active",
        lastActivity: device.lastActivity,
      })),
      activityTimeline: activityTimeline.slice(0, 100), // Limit to 100 most recent events
      statistics: {
        totalDevices: devices.length,
        activeDevices: devices.filter((d) => d.status !== "inactive").length,
        totalEvents,
        lastEventDate,
        daysActive,
      },
    };

    return NextResponse.json({
      success: true,
      data: licenseDetail,
    });
  } catch (error) {
    console.error("Error fetching license details:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch license details",
        error:
          process.env.NODE_ENV === "development"
            ? (error instanceof Error ? error.message : String(error))
            : undefined,
      },
      { status: 500 }
    );
  }
}
