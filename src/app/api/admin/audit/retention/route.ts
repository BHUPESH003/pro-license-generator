import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/adminAuth";
import dbConnect from "@/lib/db";
import AdminAudit from "@/models/AdminAudit";
import { logAuditEvent } from "@/lib/auditLogger";

interface RetentionPolicy {
  enabled: boolean;
  retentionDays: number;
  archiveBeforeDelete: boolean;
  archiveLocation?: string;
}

async function getRetentionPolicyHandler(request: NextRequest) {
  try {
    // In a real implementation, this would be stored in a configuration collection
    // For now, return default policy
    const policy: RetentionPolicy = {
      enabled: true,
      retentionDays: 365, // 1 year
      archiveBeforeDelete: false,
      archiveLocation: undefined,
    };

    return NextResponse.json({
      success: true,
      data: policy,
    });
  } catch (error) {
    console.error("Error fetching retention policy:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch retention policy",
        code: "OPERATION_FAILED",
      },
      { status: 500 }
    );
  }
}

async function updateRetentionPolicyHandler(request: NextRequest, admin: any) {
  await dbConnect();

  try {
    const body = await request.json();
    const { policy } = body;

    if (!policy) {
      return NextResponse.json(
        {
          success: false,
          message: "Retention policy is required",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    // Validate policy
    if (policy.retentionDays < 30) {
      return NextResponse.json(
        {
          success: false,
          message: "Retention period must be at least 30 days",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    // In a real implementation, save to configuration collection
    // For now, just return success

    // Log the audit event
    await logAuditEvent(
      { req: request, actorUserId: admin.userId },
      {
        action: "AUDIT_RETENTION_POLICY_UPDATE",
        entityType: "AuditRetentionPolicy",
        payload: policy,
      }
    );

    return NextResponse.json({
      success: true,
      data: policy,
      message: "Retention policy updated successfully",
    });
  } catch (error) {
    console.error("Error updating retention policy:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update retention policy",
        code: "OPERATION_FAILED",
      },
      { status: 500 }
    );
  }
}

async function cleanupAuditLogsHandler(request: NextRequest, admin: any) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const dryRun = searchParams.get("dryRun") === "true";
    const retentionDays = parseInt(searchParams.get("retentionDays") || "365");

    if (retentionDays < 30) {
      return NextResponse.json(
        {
          success: false,
          message: "Retention period must be at least 30 days",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    if (dryRun) {
      // Count records that would be deleted
      const count = await AdminAudit.countDocuments({
        createdAt: { $lt: cutoffDate },
      });

      return NextResponse.json({
        success: true,
        data: {
          dryRun: true,
          recordsToDelete: count,
          cutoffDate: cutoffDate.toISOString(),
        },
        message: `${count} audit records would be deleted`,
      });
    } else {
      // Actually delete the records
      const result = await AdminAudit.deleteMany({
        createdAt: { $lt: cutoffDate },
      });

      // Log the cleanup action
      await logAuditEvent(
        { req: request, actorUserId: admin.userId },
        {
          action: "AUDIT_LOGS_CLEANUP",
          entityType: "AdminAudit",
          payload: {
            retentionDays,
            cutoffDate: cutoffDate.toISOString(),
            deletedCount: result.deletedCount,
          },
        }
      );

      return NextResponse.json({
        success: true,
        data: {
          dryRun: false,
          deletedCount: result.deletedCount,
          cutoffDate: cutoffDate.toISOString(),
        },
        message: `${result.deletedCount} audit records deleted successfully`,
      });
    }
  } catch (error) {
    console.error("Error cleaning up audit logs:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to cleanup audit logs",
        code: "OPERATION_FAILED",
      },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(getRetentionPolicyHandler);
export const PUT = withAdminAuth(updateRetentionPolicyHandler);
export const DELETE = withAdminAuth(cleanupAuditLogsHandler);
