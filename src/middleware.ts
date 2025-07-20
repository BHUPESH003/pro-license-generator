import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");
  const publicPaths = [
    "/",
    "/marketing",
    "/login",
    "/register",
    "/forgot-password",
    "/create-password",
  ];
  const { pathname } = request.nextUrl;

  // If logged in and on a public page, redirect to dashboard
  if (token && publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If not logged in and on a protected dashboard route, redirect to login
  if (
    !token &&
    (pathname === "/dashboard" || pathname.startsWith("/dashboard/"))
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/marketing",
    "/login",
    "/register",
    "/forgot-password",
    "/create-password",
    "/dashboard",
    "/dashboard/:path*",
  ],
};
