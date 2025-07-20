import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const isDev = process.env.NODE_ENV === "development";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }
    await dbConnect();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 400 }
      );
    }
    if (!user.password) {
      return NextResponse.json(
        {
          error:
            "You must set your password before logging in. Please check your email for the setup link.",
        },
        { status: 400 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 400 }
      );
    }
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // Set cookie in response
    const response = NextResponse.json({ success: true }, { status: 200 });

    response.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      sameSite: "lax",
      secure: process.env.NODE_ENV !== "development",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
