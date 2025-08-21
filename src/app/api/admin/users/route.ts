import { NextRequest, NextResponse } from "next/server";
import {
  withAdminReadSecurity,
  withAdminExportSecurity,
} from "@/lib/securityMiddleware";
import { commonSchemas } from "@/lib/inputValidation";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import License from "@/models/License";
import Device from "@/models/Device";

interface UserWithCounts {
  _id: string;
  email: string;
  name?: string;
  role?: string;
  lastSeenAt?: Date;
  stripeCustomerId?: string;
  createdAt: Date;
  licenseCount: number;
  deviceCount: number;
}

async function getUsersHandler(request: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(request.url);

  // Parse query parameters
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = Math.min(
    parseInt(searchParams.get("pageSize") || "25"),
    100
  );
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortDir = searchParams.get("sortDir") === "desc" ? -1 : 1;

  // Build match conditions
  const matchConditions: any = {};

  // Email search filter
  const emailFilter = searchParams.get("filter_email");
  if (emailFilter) {
    matchConditions.email = { $regex: emailFilter, $options: "i" };
  }

  // Name search filter
  const nameFilter = searchParams.get("filter_name");
  if (nameFilter) {
    matchConditions.name = { $regex: nameFilter, $options: "i" };
  }

  // Role filter
  const roleFilter = searchParams.get("filter_role");
  if (roleFilter) {
    if (roleFilter === "admin") {
      matchConditions.role = "admin";
    } else if (roleFilter === "user") {
      matchConditions.$or = [
        { role: { $exists: false } },
        { role: { $ne: "admin" } },
      ];
    }
  }

  // Date range filter
  const createdAfter = searchParams.get("filter_createdAfter");
  const createdBefore = searchParams.get("filter_createdBefore");
  if (createdAfter || createdBefore) {
    matchConditions.createdAt = {};
    if (createdAfter) {
      matchConditions.createdAt.$gte = new Date(createdAfter);
    }
    if (createdBefore) {
      matchConditions.createdAt.$lte = new Date(createdBefore);
    }
  }

  // Handle CSV export
  if (searchParams.get("export") === "csv") {
    const users = await User.aggregate([
      { $match: matchConditions },
      {
        $lookup: {
          from: "licenses",
          localField: "_id",
          foreignField: "userId",
          as: "licenses",
        },
      },
      {
        $lookup: {
          from: "devices",
          localField: "_id",
          foreignField: "userId",
          as: "devices",
        },
      },
      {
        $addFields: {
          licenseCount: { $size: "$licenses" },
          deviceCount: { $size: "$devices" },
        },
      },
      {
        $project: {
          email: 1,
          name: 1,
          role: 1,
          lastSeenAt: 1,
          stripeCustomerId: 1,
          createdAt: 1,
          licenseCount: 1,
          deviceCount: 1,
        },
      },
      { $sort: { [sortBy]: sortDir } },
    ]);

    const csvHeaders =
      "ID,Email,Name,Role,License Count,Device Count,Last Seen,Stripe Customer ID,Created At\n";
    const csvRows = users
      .map((user) => {
        const role = user.role || "user";
        const name = user.name || "";
        const lastSeen = user.lastSeenAt ? user.lastSeenAt.toISOString() : "";
        const stripeId = user.stripeCustomerId || "";
        const createdAt = user.createdAt ? user.createdAt.toISOString() : "";

        return `${user._id},"${user.email}","${name}","${role}",${user.licenseCount},${user.deviceCount},"${lastSeen}","${stripeId}","${createdAt}"`;
      })
      .join("\n");

    return new NextResponse(csvHeaders + csvRows, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=users-export.csv",
      },
    });
  }

  // Build aggregation pipeline for paginated results
  const pipeline: any[] = [
    { $match: matchConditions },
    {
      $lookup: {
        from: "licenses",
        localField: "_id",
        foreignField: "userId",
        as: "licenses",
      },
    },
    {
      $lookup: {
        from: "devices",
        localField: "_id",
        foreignField: "userId",
        as: "devices",
      },
    },
    {
      $addFields: {
        licenseCount: { $size: "$licenses" },
        deviceCount: { $size: "$devices" },
      },
    },
    {
      $project: {
        email: 1,
        name: 1,
        role: 1,
        lastSeenAt: 1,
        stripeCustomerId: 1,
        createdAt: 1,
        licenseCount: 1,
        deviceCount: 1,
      },
    },
  ];

  // Get total count
  const totalPipeline = [...pipeline, { $count: "total" }];
  const totalResult = await User.aggregate(totalPipeline);
  const total = totalResult[0]?.total || 0;

  // Get paginated results
  const resultsPipeline = [
    ...pipeline,
    { $sort: { [sortBy]: sortDir as 1 | -1 } },
    { $skip: (page - 1) * pageSize },
    { $limit: pageSize },
  ];

  const users = await User.aggregate(resultsPipeline);

  const totalPages = Math.ceil(total / pageSize);

  return NextResponse.json({
    success: true,
    data: {
      rows: users.map((user) => ({
        ...user,
        id: user._id.toString(),
        role: user.role || "user",
      })),
      page,
      pageSize,
      total,
      totalPages,
    },
  });
}

// Apply security middleware with input validation
const securedGetUsersHandler = withAdminReadSecurity(getUsersHandler, {
  query: {
    ...commonSchemas.pagination,
    ...commonSchemas.userFilters,
    ...commonSchemas.sorting,
    export: { type: "string", enum: ["csv"] },
  },
});

// For CSV exports, use export-specific security
const exportUsersHandler = withAdminExportSecurity(getUsersHandler, {
  query: {
    ...commonSchemas.userFilters,
    ...commonSchemas.sorting,
    export: { type: "string", enum: ["csv"], required: true },
  },
});

export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const isExport = searchParams.get("export") === "csv";

  if (isExport) {
    return exportUsersHandler(request);
  } else {
    return securedGetUsersHandler(request);
  }
};
