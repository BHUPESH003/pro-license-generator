import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  // The user ID is now available from the request headers,
  // thanks to our middleware!
  const userId = request.headers.get("x-user-id");

  if (!userId) {
    // This case should ideally not be reached if the middleware is configured correctly.
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 }
    );
  }

  try {
    await dbConnect();
    const user = await User.findById(userId).select(
      "email _id role lastSeenAt"
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update lastSeenAt for admin users
    if (user.role === "admin") {
      user.lastSeenAt = new Date();
      await user.save();
    }

    // Don't send back sensitive data like passwords
    const { password, ...userWithoutPassword } = user.toObject();

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred while fetching user data." },
      { status: 500 }
    );
  }
}
