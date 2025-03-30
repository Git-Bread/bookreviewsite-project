import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// NextAuth's built-in middleware helper
export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Only allow requests with valid tokens
    },
  }
);

// paths require authentication
export const config = {
  matcher: ["/api/reviews/:path*", "/dashboard/:path*"]
};