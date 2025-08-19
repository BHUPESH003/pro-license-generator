import { NextRequest } from "next/server";
import { generateCSRFTokenResponse } from "@/lib/csrfProtection";
import { withAdminReadSecurity } from "@/lib/securityMiddleware";

async function getCSRFTokenHandler(req: NextRequest) {
  return generateCSRFTokenResponse(req);
}

export const GET = withAdminReadSecurity(getCSRFTokenHandler);
