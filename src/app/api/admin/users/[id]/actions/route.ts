import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/adminAuth";

interface AdminUser {
  userId: string;
  email: string;
  role: string;
}
import dbConnect from "@/lib/db";
import User from "@/models/User";
import License from "@/models/License";
import Device from "@/models/Device";
import AdminAudit from "@/models/AdminAudit";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

async function userActionsHandler(
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
    const { action, ...actionData } = body;

    // Get user
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

    switch (action) {
      case "reset_password":
        return await handlePasswordReset(user, admin, actionData);

      case "deactivate_account":
        return await handleAccountDeactivation(user, admin, actionData);

      case "activate_account":
        return await handleAccountActivation(user, admin.userId, actionData);

      case "delete_account":
        return await handleAccountDeletion(user, admin.userId, actionData);

      default:
        return NextResponse.json(
          {
            success: false,
            message: "Invalid action",
            code: "VALIDATION_ERROR",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error performing user action:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to perform user action",
        code: "OPERATION_FAILED",
      },
      { status: 500 }
    );
  }
}

async function handlePasswordReset(
  user: any,
  admin: AdminUser,
  actionData: any
) {
  const { newPassword, sendEmail = false } = actionData;

  if (!newPassword || newPassword.length < 8) {
    return NextResponse.json(
      {
        success: false,
        message: "Password must be at least 8 characters long",
        code: "VALIDATION_ERROR",
      },
      { status: 400 }
    );
  }

  // Hash the new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Update user password
  await User.findByIdAndUpdate(user._id, {
    password: hashedPassword,
  });

  // Log the action
  await AdminAudit.create({
    actorUserId: admin.userId,
    action: "password_reset",
    entityType: "user",
    entityId: user._id.toString(),
    payload: {
      sendEmail,
      resetBy: "admin",
    },
  });

  // TODO: Send email notification if requested
  if (sendEmail) {
    // Implementation would go here for sending password reset notification
    console.log(`Password reset email would be sent to ${user.email}`);
  }

  return NextResponse.json({
    success: true,
    message: "Password reset successfully",
  });
}

async function handleAccountDeactivation(
  user: any,
  admin: AdminUser,
  actionData: any
) {
  const { reason } = actionData;

  // Prevent self-deactivation
  if (admin.userId === user._id.toString()) {
    return NextResponse.json(
      {
        success: false,
        message: "Cannot deactivate your own account",
        code: "VALIDATION_ERROR",
      },
      { status: 400 }
    );
  }

  // Deactivate all user's licenses
  await License.updateMany({ userId: user._id }, { status: "inactive" });

  // Deactivate all user's devices
  await Device.updateMany({ userId: user._id }, { status: "inactive" });

  // Log the action
  await AdminAudit.create({
    actorUserId: admin.userId,
    action: "account_deactivated",
    entityType: "user",
    entityId: user._id.toString(),
    payload: {
      reason: reason || "No reason provided",
      deactivatedLicenses: await License.countDocuments({ userId: user._id }),
      deactivatedDevices: await Device.countDocuments({ userId: user._id }),
    },
  });

  return NextResponse.json({
    success: true,
    message: "Account deactivated successfully",
  });
}

async function handleAccountActivation(
  user: any,
  adminUserId: string,
  actionData: any
) {
  const { activateLicenses = false, activateDevices = false } = actionData;

  let activatedLicenses = 0;
  let activatedDevices = 0;

  // Optionally reactivate licenses
  if (activateLicenses) {
    const result = await License.updateMany(
      { userId: user._id, status: "inactive" },
      { status: "active" }
    );
    activatedLicenses = result.modifiedCount;
  }

  // Optionally reactivate devices
  if (activateDevices) {
    const result = await Device.updateMany(
      { userId: user._id, status: "inactive" },
      { status: "active" }
    );
    activatedDevices = result.modifiedCount;
  }

  // Log the action
  await AdminAudit.create({
    actorUserId: adminUserId,
    action: "account_activated",
    entityType: "user",
    entityId: user._id.toString(),
    payload: {
      activatedLicenses,
      activatedDevices,
    },
  });

  return NextResponse.json({
    success: true,
    message: "Account activated successfully",
    data: {
      activatedLicenses,
      activatedDevices,
    },
  });
}

async function handleAccountDeletion(
  user: any,
  adminUserId: string,
  actionData: any
) {
  const { confirmation, deleteData = false } = actionData;

  // Require confirmation
  if (confirmation !== user.email) {
    return NextResponse.json(
      {
        success: false,
        message: "Email confirmation required for account deletion",
        code: "VALIDATION_ERROR",
      },
      { status: 400 }
    );
  }

  // Prevent self-deletion
  if (adminUserId === user._id.toString()) {
    return NextResponse.json(
      {
        success: false,
        message: "Cannot delete your own account",
        code: "VALIDATION_ERROR",
      },
      { status: 400 }
    );
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      if (deleteData) {
        // Delete associated data
        await License.deleteMany({ userId: user._id }).session(session);
        await Device.deleteMany({ userId: user._id }).session(session);
      } else {
        // Just deactivate associated data
        await License.updateMany(
          { userId: user._id },
          { status: "inactive" }
        ).session(session);
        await Device.updateMany(
          { userId: user._id },
          { status: "inactive" }
        ).session(session);
      }

      // Delete the user
      await User.findByIdAndDelete(user._id).session(session);

      // Log the action
      await AdminAudit.create(
        [
          {
            actorUserId: adminUserId,
            action: "account_deleted",
            entityType: "user",
            entityId: user._id.toString(),
            payload: {
              deletedUserEmail: user.email,
              deleteData,
              deletionReason: actionData.reason || "No reason provided",
            },
          },
        ],
        { session }
      );
    });

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete account",
        code: "OPERATION_FAILED",
      },
      { status: 500 }
    );
  } finally {
    await session.endSession();
  }
}

export const POST = withAdminAuth(userActionsHandler);
