import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Define protected API routes
  const isProtectedApiRoute = pathname.startsWith("/api/reviews");
  
  if (isProtectedApiRoute) {
    // Check for Authorization header with Bearer token
    const authHeader = request.headers.get("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - Missing or invalid token" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    try {
      // Verify JWT token using jose
      const secret = new TextEncoder().encode(
        process.env.NEXTAUTH_SECRET || "your-fallback-secret"
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