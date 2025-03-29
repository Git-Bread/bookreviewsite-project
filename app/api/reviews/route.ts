import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { reviews, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getTokenData } from "@/lib/jwt";

// Helper function to create a query with user join, avoids repetition, only thing it does is adds username to the reviews query
function createReviewQuery() {
  return db.select({
    id: reviews.id,
    userId: reviews.userId,
    bookId: reviews.bookId,
    rating: reviews.rating,
    review: reviews.review,
    title: reviews.title,
    createdAt: reviews.createdAt,
    updatedAt: reviews.updatedAt,
    username: users.username,
  })
  .from(reviews)
  .leftJoin(users, eq(reviews.userId, users.id));
}

// Get reviews based on query parameters - Public
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const getAll = url.searchParams.get("all") === "true";
    const userData = await getTokenData(request);
    
    // Case 1: Get current authenticated user's reviews (private, requires auth)
    if (!getAll && !userId) {
      if (!userData) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const userReviews = await createReviewQuery()
        .where(eq(reviews.userId, userData.id))
        .all();
      
      return NextResponse.json(userReviews);
    }
    
    // Case 2: Get all reviews (public)
    if (getAll) {
      const allReviews = await createReviewQuery().all();
      return NextResponse.json(allReviews);
    }
    
    // Case 3: Get reviews by specific user ID (public)
    if (userId) {
      const userIdNum = parseInt(userId);
      
      if (isNaN(userIdNum)) {
        return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
      }
      
      const userReviews = await createReviewQuery()
        .where(eq(reviews.userId, userIdNum))
        .all();
      
      return NextResponse.json(userReviews);
    }
    
    // Fallback
    return NextResponse.json(
      { error: "Invalid request. Use 'all=true' or 'userId=X' parameters." },
      { status: 400 }
    );

  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// Create a new review
export async function POST(request: NextRequest) {
  try {
    const userData = await getTokenData(request);

    if (!userData) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { bookId, rating, review, title } = await request.json();

    if (!bookId) {
      return NextResponse.json(
        { error: "Book ID is required" },
        { status: 400 }
      );
    }

    const [newReview] = await db.insert(reviews)
      .values({
        userId: userData.id,
        bookId,
        rating,
        review,
        title,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
