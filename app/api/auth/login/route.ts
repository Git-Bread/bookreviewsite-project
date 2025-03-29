import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SignJWT } from "jose";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Find user in database
    const user = await db.select()
      .from(users)
      .where(eq(users.username, username))
      .get();

    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Generate JWT token using jose
    const secret = new TextEncoder().encode(
      process.env.NEXTAUTH_SECRET || 
      (() => {
        console.warn("WARNING: Using fallback secret. Set NEXTAUTH_SECRET in env!");
        return "Thisisthebestsecretkeyever...pleasechangeit";
      })()
    );
    
    const token = await new SignJWT({ 
      id: user.id, 
      username: user.username 
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(secret);

    // Return user data and token
    const response = NextResponse.json({
      user: {
        id: user.id,
        username: user.username
      },
      success: true
    });

    //Set JWT as HttpOnly cookie
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
      path: "/"
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}