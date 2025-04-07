import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
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
    
    // Rest of your implementation...
  } catch (error) {
    // Error handling
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
    
    // Delete the user
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

// PATCH - Update a user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Record<string, string> }
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

    // Extract the ID from the URL instead of params
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const idFromUrl = pathParts[pathParts.length - 1];
    const userId = parseInt(idFromUrl);

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
    const updateData: any = {
      updatedAt: new Date()
    };

    // Add admin status if provided
    if (typeof admin === 'boolean') {
      updateData.admin = admin;
    }

    // Add username if provided
    if (username) {
      // Check if username already exists (for another user)
      const existingUser = await db.select()
        .from(users)
        .where(eq(users.username, username))
        .get();

      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json(
          { error: "Username already exists" },
          { status: 400 }
        );
      }
      
      updateData.username = username;
    }

    // Hash password if provided
    if (password) {
      if (password.length < 8) {
        return NextResponse.json(
          { error: "Password must be at least 8 characters" },
          { status: 400 }
        );
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update user
    await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}