import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import db from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

// Check if the user is an admin
async function isAdmin(session: any) {
  if (!session?.user?.id) return false;
  
  const user = await db.select({ isAdmin: users.isAdmin })
    .from(users)
    .where(eq(users.id, parseInt(session.user.id)))
    .get();
    
  return user?.isAdmin === true;
}

// Get all users - Admin only
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !(await isAdmin(session))) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }
    
    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      isAdmin: users.isAdmin,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    })
    .from(users);
    
    return NextResponse.json({ users: allUsers });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// Update a user - Admin only
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !(await isAdmin(session))) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }
    
    const { id, username, password, isAdmin: setAdmin } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.id, id)).get();
    
    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Prepare update values
    const updateValues: any = {
      updatedAt: new Date()
    };
    
    if (username !== undefined) {
      // Check if username is taken by another user
      if (username !== existingUser.username) {
        const usernameExists = await db.select()
          .from(users)
          .where(eq(users.username, username))
          .get();
          
        if (usernameExists) {
          return NextResponse.json(
            { error: "Username already taken" },
            { status: 409 }
          );
        }
        
        updateValues.username = username;
      }
    }
    
    if (password) {
      if (password.length < 8) {
        return NextResponse.json(
          { error: "Password must be at least 8 characters long" },
          { status: 400 }
        );
      }
      
      updateValues.password = await bcrypt.hash(password, 10);
    }
    
    if (setAdmin !== undefined) {
      updateValues.isAdmin = !!setAdmin;
    }
    
    // Update user
    const [updatedUser] = await db.update(users)
      .set(updateValues)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        username: users.username,
        isAdmin: users.isAdmin,
        updatedAt: users.updatedAt
      });
      
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// Delete a user - Admin only
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !(await isAdmin(session))) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    
    // Don't allow deleting yourself
    if (parseInt(id) === parseInt(session.user.id)) {
      return NextResponse.json(
        { error: "Cannot delete your own admin account" },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.id, parseInt(id)))
      .get();
      
    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Delete user
    await db.delete(users).where(eq(users.id, parseInt(id)));
    
    return NextResponse.json({
      success: true,
      message: `User ${existingUser.username} deleted successfully`
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}