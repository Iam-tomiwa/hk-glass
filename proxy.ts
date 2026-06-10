import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = [
  "/unauthorized",
  "/payment-confirmation",
  "/materials",
  "/orders/review",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";

  // 1. Bypass static routes, Next.js system files, and API routes
  const isApiRoute = pathname.startsWith("/api");
  const isStaticRoute = pathname.startsWith("/_next") || pathname.includes(".");

  if (isApiRoute || isStaticRoute) {
    return NextResponse.next();
  }

  // 2. Extract subdomain
  let subdomain = "";
  if (host.includes("localhost")) {
    const parts = host.split(".");
    if (parts.length > 1 && parts[0] !== "localhost" && parts[0] !== "www") {
      subdomain = parts[0];
    }
  } else {
    const parts = host.split(".");
    if (parts.length > 2 && parts[0] !== "www") {
      subdomain = parts[0];
    }
  }

  // 3. Check authentication status
  const accessToken = request.cookies.get("access_token")?.value;
  const adminDeviceToken = request.cookies.get("admin_device_token")?.value;
  const deviceToken = request.cookies.get("device_token")?.value;
  const deviceAuth = request.cookies.get("device_auth")?.value;

  const isAdminAuthenticated = !!accessToken && !!adminDeviceToken;
  const isDeviceAuthenticated = !!deviceToken || !!deviceAuth;

  // 4. Identify if it's a public page (bypasses auth requirements)
  const segments = pathname.split("/").filter(Boolean);
  const isPublicOrderPage =
    segments.length === 1 &&
    ![
      "new-order",
      "factory",
      "admin",
      "login",
      "sales",
      ...PUBLIC_ROUTES.map((r) => r.substring(1)),
    ].includes(segments[0]);

  const isPublicPage =
    PUBLIC_ROUTES.some((route) => pathname.startsWith(route)) ||
    isPublicOrderPage;

  // 5. Handle routing and auth checks based on subdomain
  
  // Rule: Public pages are allowed on ANY domain/subdomain without login
  if (isPublicPage) {
    return NextResponse.next();
  }

  // Rule: Root domain (no subdomain) ONLY allows public pages (handled above)
  if (subdomain === "") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (subdomain === "admin") {
    // Prevent admin subdomain from accessing factory/sales internal pages
    if (pathname.startsWith("/factory") || pathname.startsWith("/sales")) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    const isLoginPage = pathname === "/admin/login" || pathname === "/login";

    if (isLoginPage) {
      if (isAdminAuthenticated) {
        // Redirect already logged-in admin to root (which rewrites to /admin)
        return NextResponse.redirect(new URL("/", request.url));
      }
      // Rewrite root-level "/login" to "/admin/login"
      if (pathname === "/login") {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/login";
        return NextResponse.rewrite(url);
      }
      return NextResponse.next();
    }

    // Protect all other admin routes
    if (!isAdminAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Rewrite path internally to /admin/... (if it doesn't already start with it)
    if (!pathname.startsWith("/admin")) {
      const url = request.nextUrl.clone();
      url.pathname = `/admin${pathname === "/" ? "" : pathname}`;
      return NextResponse.rewrite(url);
    }
  } 
  
  else if (subdomain === "factory") {
    // Prevent factory subdomain from accessing admin/sales internal pages
    if (pathname.startsWith("/admin") || pathname.startsWith("/sales")) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // Protect factory routes
    if (!isDeviceAuthenticated) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // Rewrite path internally to /factory/... (if it doesn't already start with it)
    if (!pathname.startsWith("/factory")) {
      const url = request.nextUrl.clone();
      url.pathname = `/factory${pathname === "/" ? "" : pathname}`;
      return NextResponse.rewrite(url);
    }
  } 
  
  else if (subdomain === "sales") {
    // Prevent sales subdomain from accessing admin/factory internal pages
    if (pathname.startsWith("/admin") || pathname.startsWith("/factory")) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // Protect sales routes
    if (!isDeviceAuthenticated) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // Rewrite path internally to /sales/... (if it doesn't already start with it)
    if (!pathname.startsWith("/sales")) {
      const url = request.nextUrl.clone();
      url.pathname = `/sales${pathname === "/" ? "" : pathname}`;
      return NextResponse.rewrite(url);
    }
  } 
  
  else {
    // Unknown subdomain -> redirect to unauthorized
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
