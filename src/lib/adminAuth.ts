import { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import dbConnect from "@/lib/db";
import User from "@/models/User";

interface AdminUser {
  userId: string;
  email: string;
  role: string;
}

export class AdminAuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 401
  ) {
    super(message);
    this.name = "AdminAuthError";
  }
}

/**
 * Middleware function to verify admin authentication and authorization
 * Throws AdminAuthError if authentication fails
 */
export async function requireAdmin(req: NextRequest): Promise<AdminUser> {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");

  if (!token) {
    throw new AdminAuthError(
      "No token provided",
      "AUTHENTICATION_REQUIRED",
      401
    );
  }

  try {
    // Verify JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);

    const decoded = payload as any;

    // Connect to database and verify user exists and has admin role
    await dbConnect();
    const user = await User.findById(decoded.userId).select("email role");

    if (!user) {
      throw new AdminAuthError(
        "User not found",
        "AUTHENTICATION_REQUIRED",
        401
      );
    }

    if (user.role !== "admin") {
      throw new AdminAuthError(
        "Insufficient permissions. Admin access required.",
        "AUTHORIZATION_FAILED",
        403
      );
    }

    return {
      userId: decoded.userId,
      email: decoded.email || user.email,
      role: user.role,
    };
  } catch (error) {
    if (error instanceof AdminAuthError) {
      throw error;
    }

    console.error("JWT verification failed:", error);
    throw new AdminAuthError(
      "Token invalid or expired",
      "AUTHENTICATION_REQUIRED",
      401
    );
  }
}

/**
 * Wrapper function to handle admin authentication errors in API routes
 */
export function withAdminAuth<T extends any[]>(
  handler: (req: NextRequest, admin: AdminUser, ...args: T) => Promise<Response>
) {
  return async (req: NextRequest, ...args: T): Promise<Response> => {
    try {
      const admin = await requireAdmin(req);
      return await handler(req, admin, ...args);
    } catch (error) {
      if (error instanceof AdminAuthError) {
        return new Response(
          JSON.stringify({
            success: false,
            message: error.message,
            code: error.code,
          }),
          {
            status: error.status,
            headers: { "content-type": "application/json" },
          }
        );
      }

      console.error("Unexpected error in admin auth:", error);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Internal server error",
          code: "OPERATION_FAILED",
        }),
        {
          status: 500,
          headers: { "content-type": "application/json" },
        }
      );
    }
  };
}
