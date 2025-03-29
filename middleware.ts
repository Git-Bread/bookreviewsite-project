import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Define protected API routes
  const isProtectedApiRoute = pathname.startsWith("/api/reviews");
  
  if (isProtectedApiRoute) {
    let token;
    
    // First check for token in cookie
    const tokenCookie = request.cookies.get('token');
    if (tokenCookie?.value) {
      token = tokenCookie.value;
    } else {
      // Fall back to Authorization header
      const authHeader = request.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - Missing token" },
        { status: 401 }
      );
    }
    
    try {
      // Verify JWT token using jose
      const secret = new TextEncoder().encode(
        process.env.NEXTAUTH_SECRET || (() => {
          console.warn("WARNING: Using fallback secret");
          return "Thisisthebestsecretkeyever...pleasechangeit";
        })()
      );
      
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch (error) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    "/api/reviews/:path*"  // Protect all review API routes
  ],
};