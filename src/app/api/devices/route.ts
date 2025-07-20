import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import License from "@/models/License";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let userId;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    userId = decoded.userId;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  await dbConnect();
  const licenses = await License.find({ userId }).lean();
  // Collect all deviceIds and related info
  const devices = licenses
    .filter((l) => l.deviceId)
    .map((l) => ({
      deviceId: l.deviceId,
      licenseKey: l.licenseKey,
      status: l.status,
      purchaseDate: l.purchaseDate,
    }));
  return NextResponse.json({ devices });
}
