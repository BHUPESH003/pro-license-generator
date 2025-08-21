import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/adminAuth";
import dbConnect from "@/lib/db";
import User from "@/models/User";

async function searchUsersHandler(request: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);

  if (!query || query.trim().length < 2) {
    return NextResponse.json(
      {
        success: false,
        message: "Search query must be at least 2 characters long",
        code: "VALIDATION_ERROR",
      },
      { status: 400 }
    );
  }

  try {
    // Search by email or name
    const searchConditions = {
      $or: [
        { email: { $regex: query.trim(), $options: "i" } },
        { name: { $regex: query.trim(), $options: "i" } },
      ],
    };

    const users = await User.find(searchConditions)
      .select("email name role lastSeenAt stripeCustomerId")
      .limit(limit)
      .sort({ email: 1 });

    return NextResponse.json({
      success: true,
      data: users.map((user) => ({
        id: user._id?.toString(),
        email: user.email,
        name: user.name,
        role: user.role || "user",
        lastSeenAt: user.lastSeenAt,
        stripeCustomerId: user.stripeCustomerId,
      })),
    });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to search users",
        code: "OPERATION_FAILED",
      },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(searchUsersHandler);
