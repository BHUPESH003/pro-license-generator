import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );

    // Clear the refresh token cookie
    response.cookies.set("refreshToken", "", { httpOnly: true, maxAge: 0, path: "/" });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Logout failed." }, { status: 500 });
  }
}