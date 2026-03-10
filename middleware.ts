import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isApiRoute = pathname.startsWith("/api");
  const isStaticRoute = pathname.startsWith("/_next") || pathname.includes(".");

  if (isApiRoute || isStaticRoute) {
    return NextResponse.next();
  }

  const isAdminPath = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";
  const isUnauthorizedPage = pathname === "/unauthorized";

  // Check for authentication tokens in cookies
  const accessToken = request.cookies.get("access_token")?.value;
  const adminDeviceToken = request.cookies.get("admin_device_token")?.value;
  const deviceToken = request.cookies.get("device_token")?.value;

  const isAdminAuthenticated = !!accessToken && !!adminDeviceToken;
  const isDeviceAuthenticated = !!deviceToken;

  // Protect Admin specific routes
  if (isAdminPath) {
    if (isLoginPage && isAdminAuthenticated) {
      // Redirect authenticated admin from login to dashboard
      const targetUrl = new URL("/admin", request.url);
      return NextResponse.redirect(targetUrl);
    }

    if (!isLoginPage && !isAdminAuthenticated) {
      // Redirect unauthenticated admin to login
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // Protect Sales and Factory generic routes (all remaining app routes except unauthorized page)
  if (!isUnauthorizedPage && !isDeviceAuthenticated) {
    const unauthUrl = new URL("/unauthorized", request.url);
    return NextResponse.redirect(unauthUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
