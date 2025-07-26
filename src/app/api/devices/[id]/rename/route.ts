import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Device from "@/models/Device";

export async function POST(req: NextRequest, context: any) {
  const { id: deviceId } = context.params;
  const userId = req.headers.get("x-user-id");
  const { newName } = await req.json();

  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!newName)
    return NextResponse.json(
      { error: "New name is required" },
      { status: 400 }
    );

  await dbConnect();

  const device = await Device.findOneAndUpdate(
    { _id: deviceId, userId },
    { name: newName },
    { new: true }
  );

  if (!device)
    return NextResponse.json({ error: "Device not found" }, { status: 404 });

  return NextResponse.json({ message: "Device renamed", device });
}
