import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/adminAuth";
import {
  withAuditLogging,
  createCrudAuditData,
  sanitizePayload,
} from "@/lib/auditLogger";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

interface UpdateAdminRequest {
  name?: string;
  password?: string;
  email?: string;
}

async function getAdminHandler(
  request: NextRequest,
  admin: any,
  context: { params: Promise<{ id: string }> }
) {
  await dbConnect();

  try {
    const { id } = await context.params;

    const adminUser = await User.findById(id)
      .select("email name role lastSeenAt createdAt")
      .lean();

    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin user not found",
          code: "RESOURCE_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...adminUser,
        id: (adminUser._id as any).toString(),
      },
    });
  } catch (error) {
    console.error("Error fetching admin user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch admin user",
        code: "OPERATION_FAILED",
      },
      { status: 500 }
    );
  }
}

async function updateAdminHandler(
  request: NextRequest,
  admin: any,
  context: { params: Promise<{ id: string }> }
) {
  await dbConnect();

  try {
    const { id } = await context.params;
    const body: UpdateAdminRequest = await request.json();
    const { name, password, email } = body;

    // Find the admin user
    const adminUser = await User.findById(id);
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin user not found",
          code: "RESOURCE_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // Prevent self-deletion or role change
    if (admin.userId === id) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot modify your own admin account",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    // Update fields
    if (name !== undefined) {
      adminUser.name = name;
    }

    if (email !== undefined) {
      // Check if email is already taken
      const existingUser = await User.findOne({
        email,
        _id: { $ne: id },
      });
      if (existingUser) {
        return NextResponse.json(
          {
            success: false,
            message: "Email is already taken",
            code: "VALIDATION_ERROR",
          },
          { status: 400 }
        );
      }
      adminUser.email = email;
    }

    if (password !== undefined) {
      if (password.length < 8) {
        return NextResponse.json(
          {
            success: false,
            message: "Password must be at least 8 characters long",
            code: "VALIDATION_ERROR",
          },
          { status: 400 }
        );
      }
      adminUser.password = password; // Will be hashed by pre-save middleware
    }

    await adminUser.save();

    // Return updated admin without password
    const updatedAdmin = {
      id: (adminUser._id as any).toString(),
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
      lastSeenAt: (adminUser as any).lastSeenAt,
      createdAt: (adminUser as any).createdAt,
    };

    return NextResponse.json({
      success: true,
      data: updatedAdmin,
      message: "Admin user updated successfully",
    });
  } catch (error) {
    console.error("Error updating admin user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update admin user",
        code: "OPERATION_FAILED",
      },
      { status: 500 }
    );
  }
}

async function deleteAdminHandler(
  request: NextRequest,
  admin: any,
  context: { params: Promise<{ id: string }> }
) {
  await dbConnect();

  try {
    const { id } = await context.params;

    // Prevent self-deletion
    if (admin.userId === id) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot delete your own admin account",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    // Find and delete the admin user
    const adminUser = await User.findById(id);
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin user not found",
          code: "RESOURCE_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // Check if this is the last admin
    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount <= 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot delete the last admin user",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Admin user deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting admin user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete admin user",
        code: "OPERATION_FAILED",
      },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(getAdminHandler);
export const PUT = withAuditLogging(
  withAdminAuth(updateAdminHandler),
  async (req, admin) => {
    const url = new URL(req.url);
    const segments = url.pathname.split("/");
    const id = segments[segments.length - 1];
    const body = await req.json();
    return createCrudAuditData(
      "UPDATE",
      "AdminUser",
      id,
      sanitizePayload(body)
    );
  }
);
export const DELETE = withAuditLogging(
  withAdminAuth(deleteAdminHandler),
  async (req, admin) => {
    const url = new URL(req.url);
    const segments = url.pathname.split("/");
    const id = segments[segments.length - 1];
    return createCrudAuditData("DELETE", "AdminUser", id);
  }
);
