import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/adminAuth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import License from "@/models/License";
import Device from "@/models/Device";
import AdminAudit from "@/models/AdminAudit";
import mongoose from "mongoose";

interface AdminUser {
  userId: string;
  email: string;
  role: string;
}

async function getUserDetailHandler(
  request: NextRequest,
  admin: AdminUser,
  context: { params: Promise<{ id: string }> }
) {
  await dbConnect();

  const params = await context.params;
  const { id } = params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid user ID",
        code: "VALIDATION_ERROR",
      },
      { status: 400 }
    );
  }

  try {
    // Get user details
    const user = await User.findById(id).select("-password");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
          code: "RESOURCE_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // Get associated licenses with device information
    const licenses = await License.find({ userId: id })
      .populate({
        path: "userId",
        select: "email name",
      })
      .sort({ purchaseDate: -1 });

    // Get associated devices
    const devices = await Device.find({ userId: id })
      .populate({
        path: "licenseId",
        select: "licenseKey plan status",
      })
      .sort({ lastActivity: -1 });

    // Get recent audit logs for this user
    const auditLogs = await AdminAudit.find({
      $or: [
        { entityType: "user", entityId: id },
        { actorUserId: id }, // Actions performed by this user if they're an admin
      ],
    })
      .populate({
        path: "actorUserId",
        select: "email name",
      })
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          ...user.toObject(),
          id: user._id?.toString(),
          role: user.role || "user",
        },
        licenses: licenses.map((license) => ({
          ...license.toObject(),
          id: license._id?.toString(),
        })),
        devices: devices.map((device) => ({
          ...device.toObject(),
          id: device._id?.toString(),
        })),
        auditLogs: auditLogs.map((log) => ({
          ...log.toObject(),
          id: log._id.toString(),
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch user details",
        code: "OPERATION_FAILED",
      },
      { status: 500 }
    );
  }
}

async function updateUserHandler(
  request: NextRequest,
  admin: any,
  context: { params: Promise<{ id: string }> }
) {
  await dbConnect();

  const { id } = await context.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid user ID",
        code: "VALIDATION_ERROR",
      },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { role, name, email } = body;

    // Get current user to compare changes
    const currentUser = await User.findById(id);
    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
          code: "RESOURCE_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // Validate role change
    if (role !== undefined && !["admin", "user"].includes(role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid role. Must be 'admin' or 'user'",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    // Prevent self-demotion from admin
    if (
      admin.userId === id &&
      role === "user" &&
      currentUser.role === "admin"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot remove admin role from yourself",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) {
      updateData.role = role === "admin" ? "admin" : undefined;
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
          code: "RESOURCE_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // Log the action
    await AdminAudit.create({
      actorUserId: admin.userId,
      action: "user_updated",
      entityType: "user",
      entityId: id,
      payload: {
        changes: updateData,
        previousValues: {
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role || "user",
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updatedUser.toObject(),
        id: updatedUser._id?.toString(),
        role: updatedUser.role || "user",
      },
    });
  } catch (error: any) {
    console.error("Error updating user:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "Email already exists",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update user",
        code: "OPERATION_FAILED",
      },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(getUserDetailHandler);
export const PUT = withAdminAuth(updateUserHandler);
