import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { users, reviews } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

// Get user by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params
    const params = await context.params;
    const userId = parseInt(params.id);
    
    // Validate
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    const user = await db.select({
      id: users.id,
      username: users.username,
      admin: users.admin,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    })
    .from(users)
    .where(eq(users.id, userId))
    .get();

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// Update user
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Await the params
    const params = await context.params;
    const userId = parseInt(params.id);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }
    
    // Only allow users to update their own info unless admin
    if (parseInt(session.user.id as string) !== userId && !session.user.admin) {
      return NextResponse.json(
        { error: "You can only update your own account" },
        { status: 403 }
      );
    }
    
    const { username, password } = await request.json();
    
    // Update user
    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }
    
    const [updatedUser] = await db.update(users)
      .set({
        username: username,
        password: hashedPassword || undefined,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning({ id: users.id, username: users.username });
      
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// Delete user
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Check if admin
    if (!session.user.admin) {
      return NextResponse.json(
        { error: "Only administrators can delete users" },
        { status: 403 }
      );
    }
    
    // Await the params
    const params = await context.params;
    const userId = parseInt(params.id);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }
    
    // Check for deleteReviews query parameter
    const url = new URL(request.url);
    const deleteReviews = url.searchParams.get("deleteReviews") === "true";
    
    if (!deleteReviews) {
      // Check if user has any reviews
      const userReviews = await db.select({ count: count() })
        .from(reviews)
        .where(eq(reviews.userId, userId))
        .get();
        
      if (userReviews && userReviews.count > 0) {
        return NextResponse.json(
          { error: "User has existing reviews. Use deleteReviews=true to delete user and their reviews." },
          { status: 409 }
        );
      }
    }
    
    // Delete the user (cascade will handle the reviews due to foreign key)
    await db.delete(users)
      .where(eq(users.id, userId));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}

// PATCH - Update a user (admin-specific fields)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions);
    if (!session?.user?.admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Await the params
    const params = await context.params;
    const userId = parseInt(params.id);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Get request body
    const body = await request.json();
    const { username, admin, password } = body;
    
    // Prepare update data
    const updateData: any = { updatedAt: new Date() };
    if (username !== undefined) updateData.username = username;
    if (admin !== undefined) updateData.admin = admin;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    
    // Update the user
    const [updatedUser] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning({ 
        id: users.id, 
        username: users.username,
        admin: users.admin
      });
      
    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}