import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import License from "@/models/License";
import Device from "@/models/Device";

export async function POST(req: NextRequest, context: any) {
  const { id: licenseId } = context.params;
  const userId = req.headers.get("x-user-id");
  const { name, os, deviceGuid } = await req.json();

  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!name || !os)
    return NextResponse.json(
      { error: "Missing device name or OS" },
      { status: 400 }
    );

  await dbConnect();

  const license = await License.findOne({ _id: licenseId, userId });
  if (!license)
    return NextResponse.json({ error: "License not found" }, { status: 404 });

  try {
    const device = await Device.create({
      name,
      os,
      userId,
      licenseId,
      deviceGuid,
    });

    license.status = "active";
    await license.save();

    return NextResponse.json({ message: "License activated", device });
  } catch (err: any) {
    if (err?.code === 11000 && err?.keyPattern?.deviceGuid) {
      return NextResponse.json(
        { error: "Device GUID already exists." },
        { status: 409 }
      );
    }
    throw err;
  }
}
