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

interface CreateAdminRequest {
  email: string;
  name?: string;
  password: string;
}

interface UpdateAdminRequest {
  userId: string;
  name?: string;
  password?: string;
  active?: boolean;
}

async function getAdminsHandler(request: NextRequest) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = Math.min(
      parseInt(searchParams.get("pageSize") || "25"),
      100
    );
    const sortBy = searchParams.get("sortBy") || "email";
    const sortDir = searchParams.get("sortDir") === "desc" ? -1 : 1;

    // Find all admin users
    const matchConditions = { role: "admin" };

    // Email search filter
    const emailFilter = searchParams.get("filter_email");
    if (emailFilter) {
      (matchConditions as any).email = { $regex: emailFilter, $options: "i" };
    }

    // Get total count
    const total = await User.countDocuments(matchConditions);

    // Get paginated results
    const admins = await User.find(matchConditions)
      .select("email name role lastSeenAt createdAt")
      .sort({ [sortBy]: sortDir })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      success: true,
      data: {
        rows: admins.map((admin) => ({
          ...admin,
          id: admin._id.toString(),
        })),
        page,
        pageSize,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch admin users",
        code: "OPERATION_FAILED",
      },
      { status: 500 }
    );
  }
}

async function createAdminHandler(request: NextRequest, admin: any) {
  await dbConnect();

  try {
    const body: CreateAdminRequest = await request.json();
    const { email, name, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

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

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User with this email already exists",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    // Create new admin user
    const newAdmin = new User({
      email,
      name,
      password,
      role: "admin",
      lastSeenAt: new Date(),
    });

    await newAdmin.save();

    // Return admin without password
    const adminResponse = {
      id: newAdmin._id.toString(),
      email: newAdmin.email,
      name: newAdmin.name,
      role: newAdmin.role,
      lastSeenAt: newAdmin.lastSeenAt,
      createdAt: newAdmin.createdAt,
    };

    return NextResponse.json({
      success: true,
      data: adminResponse,
      message: "Admin user created successfully",
    });
  } catch (error) {
    console.error("Error creating admin user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create admin user",
        code: "OPERATION_FAILED",
      },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(getAdminsHandler);
export const POST = withAuditLogging(
  withAdminAuth(createAdminHandler),
  async (req, admin) => {
    const body = await req.json();
    return createCrudAuditData(
      "CREATE",
      "AdminUser",
      undefined,
      sanitizePayload(body)
    );
  }
);
