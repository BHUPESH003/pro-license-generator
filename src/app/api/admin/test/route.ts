import { NextRequest } from "next/server";
import { withAdminAuth } from "@/lib/adminAuth";

export const GET = withAdminAuth(async (req: NextRequest, admin) => {
  return new Response(
    JSON.stringify({
      success: true,
      message: "Admin authentication successful",
      data: {
        userId: admin.userId,
        email: admin.email,
        role: admin.role,
        timestamp: new Date().toISOString(),
      },
    }),
    {
      status: 200,
      headers: { "content-type": "application/json" },
    }
  );
});
