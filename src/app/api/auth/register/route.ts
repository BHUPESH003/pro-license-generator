import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { sendEmailToSQS } from "@/lib/sqsService";
import jwt from "jsonwebtoken";

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
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists." },
        { status: 409 }
      );
    }
    let user;
    try {
      user = await User.create({ email, password: "" });
    } catch (err: any) {
      console.error("DB error during user creation:", err);
      return NextResponse.json(
        { error: "Database error during user creation." },
        { status: 500 }
      );
    }
    let token;
    try {
      token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
      );
    } catch (err: any) {
      console.error("JWT error:", err);
      return NextResponse.json(
        { error: "Failed to generate password setup token." },
        { status: 500 }
      );
    }
    try {
      await sendEmailToSQS({
        email,
        template: "renderPasswordSetupTemplate",
        data: {
          setupUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/create-password?token=${token}`,
        },
      });
    } catch (err: any) {
      console.error("SQS/email error:", err);
      return NextResponse.json(
        { error: "Failed to send password setup email." },
        { status: 500 }
      );
    }
    return NextResponse.json(
      {
        message:
          "Registration successful! Please check your email to set your password.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration API error:", error);
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development" && error.message
            ? error.message
            : "Registration failed.",
      },
      { status: 500 }
    );
  }
}
