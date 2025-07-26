import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Device from "@/models/Device";
import License from "@/models/License";

export async function POST(req: NextRequest, context: any) {
  const userId = req.headers.get("x-user-id");
  const { id: deviceId } = context.params;

  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();

  const device = await Device.findOneAndDelete({ _id: deviceId, userId });
  if (!device)
    return NextResponse.json({ error: "Device not found" }, { status: 404 });

  await License.findByIdAndUpdate(device.licenseId, { status: "inactive" });

  return NextResponse.json({ message: "Device deactivated" });
}
