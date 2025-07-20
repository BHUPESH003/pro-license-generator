import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import License from "@/models/License";
import jwt from "jsonwebtoken";

/**
 * @route   POST /api/devices/[id]/deactivate
 * @desc    Deactivates a device by removing its ID from the associated license.
 * @access  Private
 */
export async function POST(request: NextRequest, context: any) {
  // 1. Authenticate the user and get their ID from the cookie
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let userId: string;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    userId = decoded.userId;
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // 2. Connect to the database
  await dbConnect();

  try {
    const { id: deviceId } = context.params;

    // 3. Find the license associated with the device and user, and update it atomically
    const updatedLicense = await License.findOneAndUpdate(
      // Criteria: Find the license that has this deviceId AND belongs to the user
      { deviceId: deviceId, userId: userId },
      // Update: Set deviceId to null and status to 'inactive'
      { $set: { deviceId: null, status: "inactive" } },
      // Options: Return the document *after* the update
      { new: true }
    );

    // 4. If no license was found and updated, return a 404 error
    if (!updatedLicense) {
      return NextResponse.json(
        { error: "Device not found or not associated with this user." },
        { status: 404 }
      );
    }

    // 5. Return a success response with the updated data
    return NextResponse.json({
      message: "Device deactivated successfully",
      license: updatedLicense,
    });
  } catch (error) {
    console.error("Error deactivating device:", error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
