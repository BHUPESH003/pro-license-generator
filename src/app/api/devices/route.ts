import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Device from "@/models/Device";

export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();

  const devices = await Device.find({ userId })
    .populate("licenseId", "licenseKey")
    .lean();

  return NextResponse.json({
    devices: devices.map((d) => ({
      deviceId: d._id,
      name: d.name,
      os: d.os,
      licenseKey: d.licenseId.licenseKey,
      lastActivity: d.lastActivity,
    })),
  });
}
