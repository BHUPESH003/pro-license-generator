import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import License from "@/models/License";
import Device from "@/models/Device";
import AdminAudit from "@/models/AdminAudit";
import mongoose from "mongoose";

interface LicenseActionRequest {
  action: "activate" | "deactivate" | "update";
  reason?: string;
  updateData?: {
    plan?: string;
    mode?: "subscription" | "payment";
    planType?: "monthly" | "quarterly" | "yearly";
    expiryDate?: string;
  };
}

interface LicenseActionResponse {
  success: boolean;
  message: string;
  data?: {
    licenseId: string;
    action: string;
    previousStatus?: string;
    newStatus?: string;
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
    const licenseId = params.id;
    const body: LicenseActionRequest = await request.json();

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(licenseId)) {
      return NextResponse.json(
        { success: false, message: "Invalid license ID" },
        { status: 400 }
      );
    }

    // Validate action
    if (!["activate", "deactivate", "update"].includes(body.action)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid action. Must be 'activate', 'deactivate', or 'update'",
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

    // Fetch the license
    const license = await License.findById(licenseId);
    if (!license) {
      return NextResponse.json(
        { success: false, message: "License not found" },
        { status: 404 }
      );
    }

    const previousStatus = license.status;
    let newStatus = license.status;
    let updateFields: any = {};
    let actionDescription = "";
    let auditAction = "";

    // Process the action
    switch (body.action) {
      case "activate":
        if (license.status === "active") {
          return NextResponse.json(
            { success: false, message: "License is already active" },
            { status: 400 }
          );
        }
        newStatus = "active";
        updateFields.status = "active";
        actionDescription = `License activated${
          body.reason ? ` - Reason: ${body.reason}` : ""
        }`;
        auditAction = "license_activated";
        break;

      case "deactivate":
        if (license.status === "inactive") {
          return NextResponse.json(
            { success: false, message: "License is already inactive" },
            { status: 400 }
          );
        }
        newStatus = "inactive";
        updateFields.status = "inactive";
        actionDescription = `License deactivated${
          body.reason ? ` - Reason: ${body.reason}` : ""
        }`;
        auditAction = "license_deactivated";

        // Also deactivate associated devices
        await Device.updateMany({ licenseId }, { status: "inactive" });
        break;

      case "update":
        if (!body.updateData) {
          return NextResponse.json(
            {
              success: false,
              message: "Update data is required for update action",
            },
            { status: 400 }
          );
        }

        // Validate update fields
        const allowedFields = ["plan", "mode", "planType", "expiryDate"];
        const updateData = body.updateData;

        Object.keys(updateData).forEach((key) => {
          if (!allowedFields.includes(key)) {
            delete updateData[key as keyof typeof updateData];
          }
        });

        if (Object.keys(updateData).length === 0) {
          return NextResponse.json(
            { success: false, message: "No valid update fields provided" },
            { status: 400 }
          );
        }

        // Validate enum values
        if (
          updateData.mode &&
          !["subscription", "payment"].includes(updateData.mode)
        ) {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid mode. Must be 'subscription' or 'payment'",
            },
            { status: 400 }
          );
        }

        if (
          updateData.planType &&
          !["monthly", "quarterly", "yearly"].includes(updateData.planType)
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Invalid planType. Must be 'monthly', 'quarterly', or 'yearly'",
            },
            { status: 400 }
          );
        }

        // Validate expiry date
        if (updateData.expiryDate) {
          const expiryDate = new Date(updateData.expiryDate);
          if (isNaN(expiryDate.getTime())) {
            return NextResponse.json(
              { success: false, message: "Invalid expiry date format" },
              { status: 400 }
            );
          }
          updateFields.expiryDate = expiryDate;
        }

        // Apply other updates
        if (updateData.plan) updateFields.plan = updateData.plan;
        if (updateData.mode) updateFields.mode = updateData.mode;
        if (updateData.planType) updateFields.planType = updateData.planType;

        actionDescription = `License updated: ${Object.keys(updateData).join(
          ", "
        )}${body.reason ? ` - Reason: ${body.reason}` : ""}`;
        auditAction = "license_updated";
        break;
    }

    // Update the license
    const updatedLicense = await License.findByIdAndUpdate(
      licenseId,
      updateFields,
      { new: true }
    );

    if (!updatedLicense) {
      return NextResponse.json(
        { success: false, message: "Failed to update license" },
        { status: 500 }
      );
    }

    // Create audit log
    const auditLog = new AdminAudit({
      actorUserId: new mongoose.Types.ObjectId(adminUserId),
      action: auditAction,
      entityType: "license",
      entityId: licenseId,
      payload: {
        action: body.action,
        reason: body.reason,
        previousStatus,
        newStatus,
        updateFields,
        timestamp: new Date(),
      },
    });

    await auditLog.save();

    const response: LicenseActionResponse = {
      success: true,
      message: actionDescription,
      data: {
        licenseId,
        action: body.action,
        previousStatus,
        newStatus,
        auditId: auditLog._id.toString(),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error performing license action:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to perform license action",
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

// GET endpoint to retrieve available actions for a license
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

    // Fetch the license
    const license = await License.findById(licenseId).select(
      "status plan mode planType expiryDate"
    );
    if (!license) {
      return NextResponse.json(
        { success: false, message: "License not found" },
        { status: 404 }
      );
    }

    // Determine available actions based on current status
    const availableActions = [];

    if (license.status === "inactive") {
      availableActions.push({
        action: "activate",
        label: "Activate License",
        description: "Activate this license and associated devices",
        requiresReason: false,
      });
    }

    if (license.status === "active") {
      availableActions.push({
        action: "deactivate",
        label: "Deactivate License",
        description: "Deactivate this license and associated devices",
        requiresReason: true,
      });
    }

    availableActions.push({
      action: "update",
      label: "Update License",
      description: "Update license details (plan, mode, expiry date)",
      requiresReason: false,
      updateFields: {
        plan: {
          type: "text",
          label: "Plan",
          current: license.plan,
        },
        mode: {
          type: "select",
          label: "Mode",
          options: ["subscription", "payment"],
          current: license.mode,
        },
        planType: {
          type: "select",
          label: "Plan Type",
          options: ["monthly", "quarterly", "yearly"],
          current: license.planType,
        },
        expiryDate: {
          type: "date",
          label: "Expiry Date",
          current: license.expiryDate?.toISOString().split("T")[0],
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        licenseId,
        currentStatus: license.status,
        availableActions,
      },
    });
  } catch (error) {
    console.error("Error fetching license actions:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch license actions",
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
