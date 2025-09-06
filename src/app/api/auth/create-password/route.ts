import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { sendEmailToSQS } from "@/lib/sqsService";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required." },
        { status: 400 }
      );
    }
    // Server-side password policy
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);
    if (!(hasLower && hasUpper && hasNumber && hasSymbol && password.length >= 8)) {
      return NextResponse.json(
        { error: "Password must be 8+ chars with upper, lower, number, and symbol." },
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
    user.password = password; // <-- Assign plain password, let model hash it
    await user.save();
    // Send welcome email
    await sendEmailToSQS({
      email: user.email,
      template: "renderWelcomeTemplate",
      data: {
        username: user.name || user.email.split("@")[0],
        dashboardUrl: process.env.NEXT_PUBLIC_BASE_URL,
      },
    });
    return NextResponse.json({ message: "Password set successfully." });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to set password." },
      { status: 400 }
    );
  }
}
