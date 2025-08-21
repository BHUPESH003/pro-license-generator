import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

interface DecodedToken {
  userId: string;
  email?: string;
  role?: string;
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
    "/api/licenses/activate-client",
    "/api/user/profile",
    "/api/telemetry/events",
    "/api/admin/users", // Demo endpoint for DataTable testing
  ];

  // Admin routes require admin role
  const isAdminRoute =
    pathname.startsWith("/api/admin/") || pathname.startsWith("/admin");

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

      // Check admin role for admin routes
      if (isAdminRoute && decoded.role !== "admin") {
        return new NextResponse(
          JSON.stringify({
            success: false,
            message: "Insufficient permissions. Admin access required.",
            code: "AUTHORIZATION_FAILED",
          }),
          {
            status: 403,
            headers: { "content-type": "application/json" },
          }
        );
      }

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", decoded.userId);
      requestHeaders.set("x-user-email", decoded.email || "");
      requestHeaders.set("x-user-role", decoded.role || "");
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

  // When a user has a refresh token, decide redirect based on role claim
  if (sessionToken && isPublicPage) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET!);
      const { payload } = await jwtVerify(sessionToken, secret);
      const role = (payload as any)?.role;
      const dest = role === "admin" ? "/admin" : "/dashboard";
      return NextResponse.redirect(new URL(dest, request.url));
    } catch {
      // fall through to next()
    }
  }

  if (!sessionToken && (pathname.startsWith("/dashboard") || pathname.startsWith("/admin"))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Block non-admin access to /admin when logged in as non-admin
  if (sessionToken && pathname.startsWith("/admin")) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET!);
      const { payload } = await jwtVerify(sessionToken, secret);
      const role = (payload as any)?.role;
      if (role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Admin page protection - redirect to login if not authenticated or not admin
  if (pathname.startsWith("/admin")) {
    if (!sessionToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // For admin pages, we need to verify the role from the refresh token
    // This is a basic check - full verification happens in the admin layout component
    try {
      const secret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET!);
      const { payload } = await jwtVerify(sessionToken, secret);

      if (payload.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch (err) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
