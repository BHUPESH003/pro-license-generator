import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { sendEmailToSQS } from "@/lib/sqsService";

const RESET_TOKEN_EXPIRY = 1000 * 60 * 60; // 1 hour

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }
    await dbConnect();
    const user = await User.findOne({ email });
    if (user) {
      // Generate a reset token (JWT)
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
      );
      // Send reset email via SQS
      await sendEmailToSQS({
        email,
        template: "renderPasswordResetTemplate",
        data: {
          resetUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`,
        },
      });
    }
    // Always return success for security
    return NextResponse.json({
      message:
        "If an account exists for this email, a password reset link has been sent.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process request." },
      { status: 500 }
    );
  }
}
