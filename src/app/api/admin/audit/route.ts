import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/adminAuth";
import dbConnect from "@/lib/db";
import AdminAudit from "@/models/AdminAudit";
import User from "@/models/User";

async function getAuditLogsHandler(request: NextRequest) {
  await dbConnect();

  try {
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

    // Actor filter
    const actorFilter = searchParams.get("filter_actor");
    if (actorFilter) {
      // Find users matching the email pattern
      const users = await User.find({
        email: { $regex: actorFilter, $options: "i" },
      }).select("_id");

      if (users.length > 0) {
        matchConditions.actorUserId = { $in: users.map((u) => u._id) };
      } else {
        // No matching users, return empty result
        matchConditions.actorUserId = null;
      }
    }

    // Action filter
    const actionFilter = searchParams.get("filter_action");
    if (actionFilter) {
      matchConditions.action = { $regex: actionFilter, $options: "i" };
    }

    // Entity type filter
    const entityTypeFilter = searchParams.get("filter_entityType");
    if (entityTypeFilter) {
      matchConditions.entityType = entityTypeFilter;
    }

    // Entity ID filter
    const entityIdFilter = searchParams.get("filter_entityId");
    if (entityIdFilter) {
      matchConditions.entityId = { $regex: entityIdFilter, $options: "i" };
    }

    // Success filter
    const successFilter = searchParams.get("filter_success");
    if (successFilter !== null && successFilter !== "") {
      matchConditions.success = successFilter === "true";
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
      const auditLogs = await AdminAudit.aggregate([
        { $match: matchConditions },
        {
          $lookup: {
            from: "users",
            localField: "actorUserId",
            foreignField: "_id",
            as: "actor",
          },
        },
        {
          $addFields: {
            actorEmail: { $arrayElemAt: ["$actor.email", 0] },
          },
        },
        {
          $project: {
            actorEmail: 1,
            action: 1,
            entityType: 1,
            entityId: 1,
            success: 1,
            errorMessage: 1,
            ipAddress: 1,
            createdAt: 1,
          },
        },
        { $sort: { [sortBy]: sortDir } },
      ]);

      const csvHeaders =
        "Actor Email,Action,Entity Type,Entity ID,Success,Error Message,IP Address,Created At\n";
      const csvRows = auditLogs
        .map((log) => {
          const actorEmail = log.actorEmail || "";
          const action = log.action || "";
          const entityType = log.entityType || "";
          const entityId = log.entityId || "";
          const success = log.success ? "Yes" : "No";
          const errorMessage = log.errorMessage || "";
          const ipAddress = log.ipAddress || "";
          const createdAt = log.createdAt ? log.createdAt.toISOString() : "";

          return `"${actorEmail}","${action}","${entityType}","${entityId}","${success}","${errorMessage}","${ipAddress}","${createdAt}"`;
        })
        .join("\n");

      return new NextResponse(csvHeaders + csvRows, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=audit-logs-export.csv",
        },
      });
    }

    // Build aggregation pipeline for paginated results
    const pipeline: any[] = [
      { $match: matchConditions },
      {
        $lookup: {
          from: "users",
          localField: "actorUserId",
          foreignField: "_id",
          as: "actor",
        },
      },
      {
        $addFields: {
          actorEmail: { $arrayElemAt: ["$actor.email", 0] },
          actorName: { $arrayElemAt: ["$actor.name", 0] },
        },
      },
      {
        $project: {
          actorUserId: 1,
          actorEmail: 1,
          actorName: 1,
          action: 1,
          entityType: 1,
          entityId: 1,
          payload: 1,
          success: 1,
          errorMessage: 1,
          ipAddress: 1,
          userAgent: 1,
          createdAt: 1,
        },
      },
    ];

    // Get total count
    const totalPipeline = [...pipeline, { $count: "total" }];
    const totalResult = await AdminAudit.aggregate(totalPipeline);
    const total = totalResult[0]?.total || 0;

    // Get paginated results
    const resultsPipeline = [
      ...pipeline,
      { $sort: { [sortBy]: sortDir as 1 | -1 } },
      { $skip: (page - 1) * pageSize },
      { $limit: pageSize },
    ];

    const auditLogs = await AdminAudit.aggregate(resultsPipeline);

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      success: true,
      data: {
        rows: auditLogs.map((log) => ({
          ...log,
          id: log._id.toString(),
        })),
        page,
        pageSize,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch audit logs",
        code: "OPERATION_FAILED",
      },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(getAuditLogsHandler);
