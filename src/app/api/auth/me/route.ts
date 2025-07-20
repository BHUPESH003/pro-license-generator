import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ user: null });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    await dbConnect();
    const user = await User.findById((decoded as any).userId).select(
      "email _id"
    );
    if (!user) return NextResponse.json({ user: null });
    return NextResponse.json({ user: { _id: user._id, email: user.email } });
  } catch {
    return NextResponse.json({ user: null });
  }
}
