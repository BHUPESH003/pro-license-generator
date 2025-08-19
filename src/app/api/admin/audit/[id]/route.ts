import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/adminAuth";
import dbConnect from "@/lib/db";
import AdminAudit from "@/models/AdminAudit";
import User from "@/models/User";

async function getAuditLogHandler(
  request: NextRequest,
  admin: any,
  context: { params: Promise<{ id: string }> }
) {
  await dbConnect();

  try {
    const { id } = await context.params;

    const auditLog = await AdminAudit.aggregate([
      { $match: { _id: new (require("mongoose").Types.ObjectId)(id) } },
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
    ]);

    if (!auditLog || auditLog.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Audit log not found",
          code: "RESOURCE_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...auditLog[0],
        id: auditLog[0]._id.toString(),
      },
    });
  } catch (error) {
    console.error("Error fetching audit log:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch audit log",
        code: "OPERATION_FAILED",
      },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(getAuditLogHandler);
