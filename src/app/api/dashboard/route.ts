import dbConnect from "@/lib/db";
import Device from "@/models/Device";
import License from "@/models/License";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();

    const licenses = await License.find({ userId });
    const devices = await Device.find({ userId });

    return NextResponse.json({
      stats: {
        licenses: licenses.length,
        devices: devices.length,
      },
    });
  } catch (err) {
    const response = NextResponse.json({
      error: "Failed to fetch dashboard data",
    });
    return response;
  }
}
