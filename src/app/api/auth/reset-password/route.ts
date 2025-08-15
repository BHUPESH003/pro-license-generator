import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required." },
        { status: 400 }
      );
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    await dbConnect();
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "Invalid token." }, { status: 400 });
    }
    user.password = password; // <-- Assign plain password, let model hash it;
    await user.save();
    return NextResponse.json({ message: "Password reset successful." });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to reset password." },
      { status: 400 }
    );
  }
}
