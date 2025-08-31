import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import BillingSubscription from "@/models/BillingSubscription";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const email = req.headers.get("x-user-email");
    if (!email) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email }).lean();
    if (!user) {
      return NextResponse.json({ success: true, data: { subscriptions: [] } });
    }

    // Prefer local DB storage
    const local = await BillingSubscription.find({ userId: user._id })
      .sort({ created: -1 })
      .lean();
    return NextResponse.json({ success: true, data: { subscriptions: local } });
  } catch (error) {
    console.error("List subscriptions error:", (error as any)?.message || error);
    return NextResponse.json({ success: false, message: "Failed to fetch subscriptions" }, { status: 500 });
  }
}


