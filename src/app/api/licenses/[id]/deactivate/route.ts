import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import License from "@/models/License";
import Device from "@/models/Device";

export async function POST(req: NextRequest, context: any) {
  const { id: licenseId } = context.params;
  const userId = req.headers.get("x-user-id");

  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();

  const license = await License.findOne({ _id: licenseId, userId });
  if (!license)
    return NextResponse.json({ error: "License not found" }, { status: 404 });

  await Device.deleteOne({ licenseId, userId });
  license.status = "inactive";
  await license.save();

  return NextResponse.json({ message: "License deactivated" });
}
