import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { reviews } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Get a specific review by ID - Public
export async function GET(
  request: NextRequest,
  context: { params: { id?: string } }
) {
  try {
    // Access the ID safely, accounting for different param structures
    const id = context.params?.id;
    
    if (!id) {
      return NextResponse.json(
        { error: "Missing review ID" },
        { status: 400 }
      );
    }
    
    const reviewId = parseInt(id);
    
    // Validate
    if (isNaN(reviewId)) {
      return NextResponse.json(
        { error: "Invalid review ID" },
        { status: 400 }
      );
    }

    const review = await db.select()
      .from(reviews)
      .where(eq(reviews.id, reviewId))
      .get();

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error fetching review:", error);
    return NextResponse.json(
      { error: "Failed to fetch review" },
      { status: 500 }
    );
  }
}

// Update an existing review - Authentication Required
export async function PUT(
  request: NextRequest,
  context: { params: { id?: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Auth check
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 }
      );
    }

    const id = context.params?.id;
    if (!id) {
      return NextResponse.json(
        { error: "Missing review ID" },
        { status: 400 }
      );
    }
    
    const reviewId = parseInt(id);
    
    if (isNaN(reviewId)) {
      return NextResponse.json(
        { error: "Invalid review ID" },
        { status: 400 }
      );
    }
    
    const { rating, review, title } = await request.json();
  
    // Check if the review exists and belongs to the user
    const existingReview = await db.select()
      .from(reviews)
      .where(
        and(
          eq(reviews.id, reviewId),
          eq(reviews.userId, parseInt(session.user.id))
        )
      )
      .get();

    if (!existingReview) {
      return NextResponse.json(
        { error: "Review not found or you don't have permission to modify it" },
        { status: 404 }
      );
    }

    // Update the review
    const [updatedReview] = await db.update(reviews)
      .set({
        rating: rating !== undefined ? rating : existingReview.rating,
        review: review !== undefined ? review : existingReview.review,
        title: title !== undefined ? title : existingReview.title,
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, reviewId))
      .returning();

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}
  
// DELETE a review
export async function DELETE(
  request: NextRequest,
  context: { params: { id?: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const id = context.params?.id;
    if (!id) {
      return NextResponse.json(
        { error: "Missing review ID" },
        { status: 400 }
      );
    }
    
    const reviewId = parseInt(id);
    
    if (isNaN(reviewId)) {
      return NextResponse.json(
        { error: "Invalid review ID" },
        { status: 400 }
      );
    }
    
    // Get the review to check ownership
    const review = await db.select()
      .from(reviews)
      .where(eq(reviews.id, reviewId))
      .get();
    
    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }
    
    // Allow admins to delete any review, but regular users can only delete their own
    if (!session.user.admin && review.userId !== parseInt(session.user.id)) {
      return NextResponse.json(
        { error: "You can only delete your own reviews" },
        { status: 403 }
      );
    }
    
    // Delete the review
    await db.delete(reviews)
      .where(eq(reviews.id, reviewId));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}