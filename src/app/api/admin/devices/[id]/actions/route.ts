import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Device from "@/models/Device";
import License from "@/models/License";
import AdminAudit from "@/models/AdminAudit";
import mongoose from "mongoose";

interface DeviceActionRequest {
  action: "rename" | "activate" | "deactivate" | "unbind";
  reason?: string;
  newName?: string;
}

interface DeviceActionResponse {
  success: boolean;
  message: string;
  data?: {
    deviceId: string;
    action: string;
    previousValue?: string;
    newValue?: string;
    auditId: string;
  };
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const params = await context.params;
    const deviceId = params.id;
    const body: DeviceActionRequest = await request.json();

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(deviceId)) {
      return NextResponse.json(
        { success: false, message: "Invalid device ID" },
        { status: 400 }
      );
    }

    // Validate action
    if (!["rename", "activate", "deactivate", "unbind"].includes(body.action)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid action. Must be 'rename', 'activate', 'deactivate', or 'unbind'",
        },
        { status: 400 }
      );
    }

    // Get admin user ID from request headers (set by middleware)
    const adminUserId = request.headers.get("x-user-id");
    if (!adminUserId) {
      return NextResponse.json(
        { success: false, message: "Admin user ID not found" },
        { status: 401 }
      );
    }

    // Fetch the device with license information
    const device = await Device.findById(deviceId).populate(
      "licenseId",
      "licenseKey"
    );
    if (!device) {
      return NextResponse.json(
        { success: false, message: "Device not found" },
        { status: 404 }
      );
    }

    let updateFields: any = {};
    let actionDescription = "";
    let auditAction = "";
    let previousValue: string | undefined;
    let newValue: string | undefined;

    // Process the action
    switch (body.action) {
      case "rename":
        if (!body.newName || body.newName.trim().length === 0) {
          return NextResponse.json(
            {
              success: false,
              message: "New name is required for rename action",
            },
            { status: 400 }
          );
        }

        if (body.newName.trim().length > 100) {
          return NextResponse.json(
            {
              success: false,
              message: "Device name cannot exceed 100 characters",
            },
            { status: 400 }
          );
        }

        previousValue = device.name;
        newValue = body.newName.trim();

        if (previousValue === newValue) {
          return NextResponse.json(
            {
              success: false,
              message: "New name must be different from current name",
            },
            { status: 400 }
          );
        }

        updateFields.name = newValue;
        actionDescription = `Device renamed from "${previousValue}" to "${newValue}"${
          body.reason ? ` - Reason: ${body.reason}` : ""
        }`;
        auditAction = "device_renamed";
        break;

      case "activate":
        if (device.status === "active") {
          return NextResponse.json(
            { success: false, message: "Device is already active" },
            { status: 400 }
          );
        }

        previousValue = device.status;
        newValue = "active";
        updateFields.status = "active";
        actionDescription = `Device activated${
          body.reason ? ` - Reason: ${body.reason}` : ""
        }`;
        auditAction = "device_activated";
        break;

      case "deactivate":
        if (device.status === "inactive") {
          return NextResponse.json(
            { success: false, message: "Device is already inactive" },
            { status: 400 }
          );
        }

        previousValue = device.status;
        newValue = "inactive";
        updateFields.status = "inactive";
        actionDescription = `Device deactivated${
          body.reason ? ` - Reason: ${body.reason}` : ""
        }`;
        auditAction = "device_deactivated";
        break;

      case "unbind":
        // Unbinding removes the device from the license
        // This is a destructive action that requires confirmation
        if (!body.reason || body.reason.trim().length === 0) {
          return NextResponse.json(
            { success: false, message: "Reason is required for unbind action" },
            { status: 400 }
          );
        }

        // Check if this is the only device on the license
        const deviceCount = await Device.countDocuments({
          licenseId: device.licenseId,
        });

        // Safely determine the bound license key regardless of populate state
        let boundLicenseKey: string | undefined;
        const licenseRef: any = device.licenseId as any;
        if (licenseRef && typeof licenseRef === "object" && "licenseKey" in licenseRef) {
          boundLicenseKey = licenseRef.licenseKey as string;
        } else if (device.licenseId) {
          const lic = await License.findById(device.licenseId).select("licenseKey");
          boundLicenseKey = lic?.licenseKey;
        }

        previousValue = `Bound to license ${boundLicenseKey ?? "unknown"}`;
        newValue = "Unbound";
        actionDescription = `Device unbound from license ${boundLicenseKey ?? "unknown"} - Reason: ${body.reason}`;
        auditAction = "device_unbound";

        // For unbind, we'll delete the device record entirely
        // This is because a device without a license doesn't make sense in our system
        await Device.findByIdAndDelete(deviceId);

        // Create audit log before deletion
        const unbindAuditLog = new AdminAudit({
          actorUserId: new mongoose.Types.ObjectId(adminUserId),
          action: auditAction,
          entityType: "device",
          entityId: deviceId,
          payload: {
            action: body.action,
            reason: body.reason,
            deviceName: device.name,
            deviceGuid: device.deviceGuid,
            licenseKey: boundLicenseKey,
            previousValue,
            newValue,
            timestamp: new Date(),
          },
        });

        await unbindAuditLog.save();

        return NextResponse.json({
          success: true,
          message: actionDescription,
          data: {
            deviceId,
            action: body.action,
            previousValue,
            newValue,
            auditId: unbindAuditLog._id.toString(),
          },
        });
    }

    // Update the device (for non-unbind actions)
    const updatedDevice = await Device.findByIdAndUpdate(
      deviceId,
      updateFields,
      { new: true }
    );

    if (!updatedDevice) {
      return NextResponse.json(
        { success: false, message: "Failed to update device" },
        { status: 500 }
      );
    }

    // Create audit log
    const auditLog = new AdminAudit({
      actorUserId: new mongoose.Types.ObjectId(adminUserId),
      action: auditAction,
      entityType: "device",
      entityId: deviceId,
      payload: {
        action: body.action,
        reason: body.reason,
        previousValue,
        newValue,
        updateFields,
        timestamp: new Date(),
      },
    });

    await auditLog.save();

    const response: DeviceActionResponse = {
      success: true,
      message: actionDescription,
      data: {
        deviceId,
        action: body.action,
        previousValue,
        newValue,
        auditId: auditLog._id.toString(),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error performing device action:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to perform device action",
        error:
          process.env.NODE_ENV === "development"
            ? (error instanceof Error ? error.message : String(error))
            : undefined,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve available actions for a device
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

    // Fetch the device
    const device = await Device.findById(deviceId)
      .populate("licenseId", "licenseKey status")
      .select("name status deviceGuid licenseId");

    if (!device) {
      return NextResponse.json(
        { success: false, message: "Device not found" },
        { status: 404 }
      );
    }

    // Determine available actions based on current status
    const availableActions = [];

    // Rename is always available
    availableActions.push({
      action: "rename",
      label: "Rename Device",
      description: "Change the device name",
      requiresReason: false,
      requiresInput: true,
      inputType: "text",
      inputLabel: "New Device Name",
      inputPlaceholder: "Enter new device name",
      currentValue: device.name,
    });

    // Status actions
    if (device.status === "inactive") {
      availableActions.push({
        action: "activate",
        label: "Activate Device",
        description: "Activate this device",
        requiresReason: false,
      });
    }

    if (device.status === "active") {
      availableActions.push({
        action: "deactivate",
        label: "Deactivate Device",
        description: "Deactivate this device",
        requiresReason: true,
      });
    }

    // Unbind action (always available but destructive)
    availableActions.push({
      action: "unbind",
      label: "Unbind Device",
      description: "Remove device from license (destructive action)",
      requiresReason: true,
      destructive: true,
      warning:
        "This action will permanently remove the device from the system and cannot be undone.",
    });

    // Safely read license key in case populate typing is a union
    const populatedLicense: any = (device as any).licenseId;
    const populatedLicenseKey: string | undefined =
      populatedLicense && typeof populatedLicense === "object"
        ? populatedLicense.licenseKey
        : undefined;

    return NextResponse.json({
      success: true,
      data: {
        deviceId,
        deviceName: device.name,
        currentStatus: device.status,
        licenseKey: populatedLicenseKey,
        availableActions,
      },
    });
  } catch (error) {
    console.error("Error fetching device actions:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch device actions",
        error:
          process.env.NODE_ENV === "development"
            ? (error instanceof Error ? error.message : String(error))
            : undefined,
      },
      { status: 500 }
    );
  }
}
