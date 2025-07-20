import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import License from "@/models/License";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest, context: any) {
  const { id } = await context.params;
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
  const { deviceId } = await req.json();
  if (!deviceId) {
    return NextResponse.json(
      { error: "Device ID is required" },
      { status: 400 }
    );
  }
  await dbConnect();
  const license = await License.findOne({ _id: id, userId });
  if (!license) {
    return NextResponse.json({ error: "License not found" }, { status: 404 });
  }
  license.deviceId = deviceId;
  license.status = "active";
  await license.save();
  return NextResponse.json({ message: "License activated", license });
}
