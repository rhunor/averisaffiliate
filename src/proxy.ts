import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith("/api/");

  // Covers both the dashboard page shell AND the data/content APIs it calls —
  // a session that isn't paid up must not reach either one. Previously only
  // the page route was gated, so a request straight to /api/dashboard or
  // /api/academy/* with a valid-but-inactive session returned full data.
  const isOnDashboard =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/api/dashboard") ||
    pathname.startsWith("/api/academy");
  const isOnAdmin = pathname.startsWith("/admin");
  const isOnAuth =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/verify-email");

  if (isOnAuth && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  if (isOnDashboard && !isLoggedIn) {
    if (isApi) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isOnDashboard && isLoggedIn) {
    const sessionUser = req.auth?.user as unknown as Record<string, unknown>;
    // Fail closed: anything other than a literal `true` (missing, undefined,
    // null) is treated as not active, instead of only catching `=== false`.
    if (!sessionUser?.isActive) {
      if (isApi) {
        return NextResponse.json(
          { error: "Your subscription is not active. Please complete payment to access this." },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL("/pending-payment", req.nextUrl));
    }
    // Block expired non-lifetime users even if isActive is still true in their token
    const isLifetime = sessionUser?.isLifetime as boolean | undefined;
    const subscriptionExpiresAt = sessionUser?.subscriptionExpiresAt as string | null | undefined;
    if (!isLifetime && subscriptionExpiresAt && new Date(subscriptionExpiresAt) < new Date()) {
      if (isApi) {
        return NextResponse.json(
          { error: "Your subscription has expired. Please renew to continue." },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL("/pending-payment?expired=1", req.nextUrl));
    }
  }

  if (isOnAdmin) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }
    if (req.auth?.user?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/dashboard/:path*",
    "/api/academy/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
  ],
};
