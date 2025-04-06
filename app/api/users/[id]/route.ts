import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import db from "@/db";
import { users, reviews } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { cidr } from "drizzle-orm/pg-core";

// DELETE a user - Admin only
export async function DELETE(
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

    const userId = parseInt(params.id as string);
    
    // Don't allow admins to delete themselves
    if (parseInt(session.user.id) === userId) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Check if reviews should be deleted
    const url = new URL(request.url);
    const deleteReviews = url.searchParams.get("deleteReviews") === "true";

    // check if user has reviews since deletion will cascade to delete reviews
    if (!deleteReviews) {
      const userReviews = await db.select({ count: count() })
        .from(reviews)
        .where(eq(reviews.userId, userId))
        .get();
      
      if (userReviews && userReviews.count > 0) {
        return NextResponse.json(
          { error: "User has reviews. Use ?deleteReviews=true to delete user and their reviews." },
          { status: 400 }
        );
      }
    }

    await db.delete(users).where(eq(users.id, userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete user:", error);
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