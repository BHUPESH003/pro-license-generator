import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

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
    if (user.password && user.password.length > 0) {
      return NextResponse.json(
        {
          error: "Password already set. Please log in or reset your password.",
        },
        { status: 400 }
      );
    }
    console.log("[CREATE PASSWORD] Plain password:", password);
    user.password = password; // <-- Assign plain password, let model hash it
    console.log("[CREATE PASSWORD] User password set for:", user.password);
    await user.save();
    return NextResponse.json({ message: "Password set successfully." });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to set password." },
      { status: 400 }
    );
  }
}
