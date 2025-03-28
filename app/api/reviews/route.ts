import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { reviews } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getTokenData } from "@/lib/jwt";

// Get all reviews by the authenticated user
export async function GET(request: NextRequest) {
  try {
    const userData = await getTokenData(request);

    if (!userData) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userReviews = await db.select()
      .from(reviews)
      .where(eq(reviews.userId, userData.id))
      .all();

    return NextResponse.json(userReviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
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