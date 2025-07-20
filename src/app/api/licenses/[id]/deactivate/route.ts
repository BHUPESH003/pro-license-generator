import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import License from "@/models/License";
import jwt from "jsonwebtoken";

/**
 * @route   POST /api/licenses/[id]/deactivate
 * @desc    Deactivates a specific license for the authenticated user
 * @access  Private
 */
export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  // Correctly access the 'id' from the context parameters
  const { id } = await context.params;

  // 1. Authenticate the user by verifying the token from cookies
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized: No token provided." },
      { status: 401 }
    );
  }

  let userId;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    // Safely cast the decoded type to access the userId
    userId = (decoded as { userId: string }).userId;
  } catch (error) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid token." },
      { status: 401 }
    );
  }

  // 2. Connect to the database
  await dbConnect();

  try {
    // 3. Find the license, ensuring it belongs to the authenticated user
    const license = await License.findOne({ _id: id, userId: userId });

    // If no license is found, it's either the wrong ID or not owned by the user
    if (!license) {
      return NextResponse.json(
        {
          error:
            "License not found or you do not have permission to modify it.",
        },
        { status: 404 }
      );
    }

    // 4. Perform the update logic
    license.status = "inactive";
    await license.save();

    // 5. Return a success response
    return NextResponse.json({
      success: true,
      message: "License deactivated successfully.",
    });
  } catch (error) {
    console.error("Error deactivating license:", error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
