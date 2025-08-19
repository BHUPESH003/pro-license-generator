import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/adminAuth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import AdminAudit from "@/models/AdminAudit";
import mongoose from "mongoose";

interface AdminUser {
  userId: string;
  email: string;
  role: string;
}

async function updateUserRoleHandler(
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
    const body = await request.json();
    const { role, confirmation } = body;

    // Validate role
    if (!["admin", "user"].includes(role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid role. Must be 'admin' or 'user'",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    // Get current user
    const user = await User.findById(id);
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

    const currentRole = user.role || "user";
    const newRole = role;

    // Check if role is actually changing
    if (currentRole === newRole) {
      return NextResponse.json(
        {
          success: false,
          message: "User already has this role",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    // Prevent self-demotion from admin
    if (admin.userId === id && newRole === "user" && currentRole === "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot remove admin role from yourself",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    // For admin role changes, require email confirmation
    if (
      newRole === "admin" ||
      (currentRole === "admin" && newRole === "user")
    ) {
      if (confirmation !== user.email) {
        return NextResponse.json(
          {
            success: false,
            message: "Email confirmation required for admin role changes",
            code: "VALIDATION_ERROR",
          },
          { status: 400 }
        );
      }
    }

    // Update user role
    const updateData =
      newRole === "admin" ? { role: "admin" } : { $unset: { role: 1 } };
    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update user role",
          code: "OPERATION_FAILED",
        },
        { status: 500 }
      );
    }

    // Log the action
    await AdminAudit.create({
      actorUserId: admin.userId,
      action: "role_changed",
      entityType: "user",
      entityId: id,
      payload: {
        previousRole: currentRole,
        newRole: newRole,
        targetUserEmail: user.email,
        requiresConfirmation: newRole === "admin" || currentRole === "admin",
      },
    });

    return NextResponse.json({
      success: true,
      message: `User role updated to ${newRole}`,
      data: {
        ...updatedUser.toObject(),
        id: updatedUser._id?.toString(),
        role: updatedUser.role || "user",
      },
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update user role",
        code: "OPERATION_FAILED",
      },
      { status: 500 }
    );
  }
}

export const PUT = withAdminAuth(updateUserRoleHandler);
