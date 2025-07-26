import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

interface DecodedToken {
  userId: string;
  [key: string]: any;
}

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { success: false, message: "Refresh token not found." },
      { status: 401 }
    );
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    ) as DecodedToken;

    // Create a new access token
    const accessToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email }, // You can add more user details if needed
      process.env.JWT_SECRET!,
      { expiresIn: "15m" } // 15 minutes
    );

    return NextResponse.json({ success: true, accessToken });
  } catch (error) {
    // If the refresh token is invalid or expired
    const response = NextResponse.json(
      { success: false, message: "Invalid or expired refresh token." },
      { status: 401 }
    );
    // Clear the invalid refresh token cookie
    response.cookies.set("refreshToken", "", {
      httpOnly: true,
      maxAge: 0,
      path: "/",
    });
    return response;
  }
}
