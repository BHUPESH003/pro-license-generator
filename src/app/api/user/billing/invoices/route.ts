import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import BillingInvoice from "@/models/BillingInvoice";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const email = req.headers.get("x-user-email");
    if (!email) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email }).lean();
    if (!user) {
      return NextResponse.json({ success: true, data: { invoices: [] } });
    }
    const local = await BillingInvoice.find({ userId: user._id })
      .sort({ created: -1 })
      .lean();
    return NextResponse.json({ success: true, data: { invoices: local } });
  } catch (error) {
    console.error("List invoices error:", (error as any)?.message || error);
    return NextResponse.json({ success: false, message: "Failed to fetch invoices" }, { status: 500 });
  }
}


