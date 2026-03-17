import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isApiRoute = pathname.startsWith("/api");
  const isStaticRoute = pathname.startsWith("/_next") || pathname.includes(".");

  if (isApiRoute || isStaticRoute) {
    return NextResponse.next();
  }

  const isAdminPath = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";
  const isUnauthorizedPage = pathname === "/unauthorized";
  const isPaymentConfirmationPage = pathname.startsWith("/payment-confirmation");
  
  // Public order details page (/ORD-123)
  const segments = pathname.split("/").filter(Boolean);
  const isPublicOrderPage = segments.length === 1 && !["new-order", "unauthorized", "payment-confirmation", "factory"].includes(segments[0]);

  // Check for authentication tokens in cookies
  const accessToken = request.cookies.get("access_token")?.value;
  const adminDeviceToken = request.cookies.get("admin_device_token")?.value;
  const deviceToken = request.cookies.get("device_token")?.value;
  // device_auth is a SameSite=Lax mirror of device_token. SameSite=Strict
  // cookies are stripped on cross-site top-level GET navigations (e.g. the
  // browser returning from Paystack), but Lax cookies are included, so the
  // middleware can correctly identify an authenticated session in that case.
  const deviceAuth = request.cookies.get("device_auth")?.value;

  const isAdminAuthenticated = !!accessToken && !!adminDeviceToken;
  const isDeviceAuthenticated = !!deviceToken || !!deviceAuth;

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

  // Protect Sales and Factory generic routes (all remaining app routes except public pages)
  if (!isUnauthorizedPage && !isPaymentConfirmationPage && !isPublicOrderPage && !isDeviceAuthenticated) {
    const unauthUrl = new URL("/unauthorized", request.url);
    return NextResponse.redirect(unauthUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
