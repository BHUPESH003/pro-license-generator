import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

interface DecodedToken {
  userId: string;
  [key: string]: any;
}

// Utility to verify JWT using jose (Web Crypto API compatible)
async function verifyJWT(token: string): Promise<DecodedToken> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  const { payload } = await jwtVerify(token, secret);
  return payload as DecodedToken;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // List of public API routes that don't require auth
  const publicApiRoutes = [
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/forgot-password",
    "/api/auth/create-password",
    "/api/auth/reset-password",
    "/api/auth/refresh-token",
    "/api/auth/logout",
    "/api/stripe/webhook",
  ];

  // ✅ Allow public API routes
  if (
    pathname.startsWith("/api/") &&
    publicApiRoutes.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.next();
  }

  // ✅ Protected API routes
  if (pathname.startsWith("/api/")) {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return new NextResponse(
        JSON.stringify({ success: false, message: "No token provided." }),
        {
          status: 401,
          headers: { "content-type": "application/json" },
        }
      );
    }

    try {
      const decoded = await verifyJWT(token);
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", decoded.userId);
      requestHeaders.set("x-user-email", decoded.email || "");
      return NextResponse.next({ request: { headers: requestHeaders } });
    } catch (err) {
      console.error("JWT verification failed:", err);
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "Token invalid or expired.",
        }),
        {
          status: 401,
          headers: { "content-type": "application/json" },
        }
      );
    }
  }

  // ✅ Handle page protection logic
  const sessionToken = request.cookies.get("refreshToken")?.value;
  const isPublicPage = [
    "/",
    "/marketing",
    "/login",
    "/register",
    "/forgot-password",
    "/create-password",
  ].includes(pathname);

  if (sessionToken && isPublicPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!sessionToken && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
