import { jwtVerify } from "jose";
import { NextRequest } from "next/server";

export interface JwtPayload {
  id: number;
  username: string;
}

export async function getTokenData(request: NextRequest): Promise<JwtPayload | null> {
  try {
    const authHeader = request.headers.get("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);
    const secret = new TextEncoder().encode(
        process.env.NEXTAUTH_SECRET || 
        (() => {
            console.warn("WARNING: Using fallback secret. Set NEXTAUTH_SECRET in env!");
            return "Thisisthebestsecretkeyever...pleasechangeit";
        })()
    );
    
    const { payload } = await jwtVerify(token, secret);
    
    return {
      id: payload.id as number,
      username: payload.username as string
    };
  } catch (error) {
    console.error("JWT verification error:", error);
    return null;
  }
}