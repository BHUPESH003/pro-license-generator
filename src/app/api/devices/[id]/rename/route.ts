import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import License from "@/models/License";
import jwt from "jsonwebtoken";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
  const { newName } = await req.json();
  if (!newName) {
    return NextResponse.json(
      { error: "New name is required" },
      { status: 400 }
    );
  }
  await dbConnect();
  const license = await License.findOne({ deviceId: params.id, userId });
  if (!license) {
    return NextResponse.json({ error: "Device not found" }, { status: 404 });
  }
  license.deviceId = newName;
  await license.save();
  return NextResponse.json({ message: "Device renamed", deviceId: newName });
}
