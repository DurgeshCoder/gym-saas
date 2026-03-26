import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // 1. Protect specific routes based on role (PRD Section 5)
    if (pathname.startsWith("/owner") && token?.role !== "GYM_OWNER" && token?.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    
    if (pathname.startsWith("/trainer") && token?.role !== "TRAINER") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (pathname.startsWith("/member") && token?.role !== "MEMBER") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // 2. Inject gymId on API queries (For tenant isolation - PRD Section 5)
    if (pathname.startsWith("/api/") && token?.gymId) {
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-gym-id", token.gymId as string);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match specific protected routes:
     * - /owner/*
     * - /trainer/*
     * - /member/*
     * - /dashboard/*
     * - /api/gyms (but skip /api/auth)
     */
    "/owner/:path*",
    "/trainer/:path*",
    "/member/:path*",
    "/dashboard/:path*",
    "/api/gyms/:path*",
  ],
};
