import { NextRequest } from "next/server";
import AdminAudit from "@/models/AdminAudit";
import dbConnect from "@/lib/db";

export interface AuditLogData {
  actorUserId: string;
  action: string;
  entityType: string;
  entityId?: string;
  payload?: Record<string, any>;
  success?: boolean;
  errorMessage?: string;
}

export interface AuditContext {
  req: NextRequest;
  actorUserId: string;
}

/**
 * Log an admin audit event
 */
export async function logAuditEvent(
  context: AuditContext,
  data: Omit<AuditLogData, "actorUserId">
): Promise<void> {
  try {
    await dbConnect();

    const auditRecord = new AdminAudit({
      actorUserId: context.actorUserId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      payload: data.payload,
      ipAddress: getClientIP(context.req),
      userAgent: context.req.headers.get("user-agent") || undefined,
      success: data.success ?? true,
      errorMessage: data.errorMessage,
      createdAt: new Date(),
    });

    await auditRecord.save();
  } catch (error) {
    // Don't throw errors from audit logging to avoid breaking the main operation
    console.error("Failed to log audit event:", error);
  }
}

/**
 * Middleware wrapper that adds audit logging to admin operations
 */
export function withAuditLogging<T extends any[]>(
  handler: (req: NextRequest, admin: any, ...args: T) => Promise<Response>,
  getAuditData: (
    req: NextRequest,
    admin: any,
    ...args: T
  ) => Promise<Omit<AuditLogData, "actorUserId"> | null>
) {
  return async (
    req: NextRequest,
    admin: any,
    ...args: T
  ): Promise<Response> => {
    const context: AuditContext = {
      req,
      actorUserId: admin.userId,
    };

    let auditData: Omit<AuditLogData, "actorUserId"> | null = null;
    let response: Response;
    let success = true;
    let errorMessage: string | undefined;

    try {
      // Get audit data before executing the handler
      auditData = await getAuditData(req, admin, ...args);

      // Execute the main handler
      response = await handler(req, admin, ...args);

      // Check if the response indicates an error
      if (!response.ok) {
        success = false;
        try {
          const errorData = await response.clone().json();
          errorMessage = errorData.message || `HTTP ${response.status}`;
        } catch {
          errorMessage = `HTTP ${response.status}`;
        }
      }
    } catch (error) {
      success = false;
      errorMessage = error instanceof Error ? error.message : "Unknown error";
      throw error; // Re-throw to maintain original error handling
    } finally {
      // Log the audit event if we have audit data
      if (auditData) {
        await logAuditEvent(context, {
          ...auditData,
          success,
          errorMessage,
        });
      }
    }

    return response;
  };
}

/**
 * Helper function to create audit data for CRUD operations
 */
export function createCrudAuditData(
  action: "CREATE" | "READ" | "UPDATE" | "DELETE",
  entityType: string,
  entityId?: string,
  payload?: Record<string, any>
): Omit<AuditLogData, "actorUserId"> {
  return {
    action: `${entityType.toUpperCase()}_${action}`,
    entityType,
    entityId,
    payload,
  };
}

/**
 * Helper function to create audit data for custom actions
 */
export function createCustomAuditData(
  action: string,
  entityType: string,
  entityId?: string,
  payload?: Record<string, any>
): Omit<AuditLogData, "actorUserId"> {
  return {
    action,
    entityType,
    entityId,
    payload,
  };
}

/**
 * Extract client IP address from request
 */
function getClientIP(req: NextRequest): string | undefined {
  const forwarded = req.headers.get("x-forwarded-for");
  const realIP = req.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return undefined;
}

/**
 * Sanitize payload to remove sensitive information
 */
export function sanitizePayload(payload: any): any {
  if (!payload || typeof payload !== "object") {
    return payload;
  }

  const sensitiveFields = ["password", "token", "secret", "key", "auth"];
  // Handle arrays explicitly to preserve array structure
  if (Array.isArray(payload)) {
    return payload.map((item) => sanitizePayload(item));
  }

  const sanitized: any = { ...payload };

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = "[REDACTED]";
    }
  }

  // Recursively sanitize nested objects
  for (const key in sanitized) {
    if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
      sanitized[key] = sanitizePayload(sanitized[key]);
    }
  }

  return sanitized;
}
