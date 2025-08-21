import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

interface DecodedToken {
  userId: string;
  email?: string;
  role?: string;
  [key: string]: any;
}

async function verifyJWT(token: string): Promise<DecodedToken> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  const { payload } = await jwtVerify(token, secret);
  return payload as DecodedToken;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "No token provided" },
        { status: 401 }
      );
    }

    const decoded = await verifyJWT(token);

    // Check if user has admin role
    if (decoded.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Insufficient permissions. Admin access required.",
        },
        { status: 403 }
      );
    }

    // Return user info for admin users
    return NextResponse.json({
      success: true,
      user: {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      },
    });
  } catch (error) {
    console.error("Admin verification error:", error);

    // Handle JWT verification errors
    if (error instanceof Error && error.message.includes("expired")) {
      return NextResponse.json(
        { success: false, message: "Token expired" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Invalid token" },
      { status: 401 }
    );
  }
}
