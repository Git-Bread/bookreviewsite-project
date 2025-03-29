import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Create a response
    const response = NextResponse.json({ success: true });
    
    // Clear the authentication cookie if you're storing JWT in cookies
    response.cookies.delete('token');
    
    // Only needed as a fallback if server-side cookie deletion fails
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // Set cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Failed to logout" },
      { status: 500 }
    );
  }
}