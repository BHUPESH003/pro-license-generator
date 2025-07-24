import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";

interface RefreshTokenPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = await req.json();

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token is required." },
        { status: 400 }
      );
    }

    await dbConnect();

    let decoded: RefreshTokenPayload;
    try {
      // First, verify the refresh token to ensure it's valid and not expired
      decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!
      ) as RefreshTokenPayload;
    } catch (err) {
      // If the token is invalid or expired, deny access
      return NextResponse.json(
        { error: "Invalid or expired refresh token." },
        { status: 403 }
      );
    }

    // Find the user associated with the token
    const user = await User.findById(decoded.userId);

    // For enhanced security, check if the provided refresh token is the one stored in the database.
    // This helps detect token reuse or theft.
    if (!user || user.refreshToken !== refreshToken) {
      if (user) {
        // As a security measure, invalidate the user's refresh token if a mismatch occurs.
        user.refreshToken = undefined;
        await user.save();
      }
      return NextResponse.json(
        { error: "Invalid refresh token. Please log in again." },
        { status: 403 }
      );
    }

    // Generate a new access token
    const newAccessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" } // Short-lived access token
    );

    // Generate a new refresh token (token rotation)
    const newRefreshToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" } // Longer-lived refresh token
    );

    // Store the new refresh token, invalidating the old one
    user.refreshToken = newRefreshToken;
    await user.save();

    // Return the new tokens and user info
    return NextResponse.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: { id: user._id, email: user.email },
    });
  } catch (error: any) {
    console.error("RefreshToken API error:", error);
    return NextResponse.json(
      { error: "Failed to refresh token." },
      { status: 500 }
    );
  }
}
