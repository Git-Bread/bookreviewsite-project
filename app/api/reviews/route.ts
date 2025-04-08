import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import db from "@/db";
import { reviews, users } from "@/db/schema";
import { eq, like, or, sql, desc } from "drizzle-orm";

// Helper function to create a query with user join
function createReviewQuery() {
  return db.select({
    id: reviews.id,
    userId: reviews.userId,
    bookId: reviews.bookId,
    bookTitle: reviews.bookTitle,
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
    const searchQuery = url.searchParams.get("q");
    const page = parseInt(url.searchParams.get("page") || "1");
    const perPage = parseInt(url.searchParams.get("perPage") || "15");
    const session = await getServerSession(authOptions);
    const getRecent = url.searchParams.get("recent") === "true";
    const limit = parseInt(url.searchParams.get("limit") || "10");
    
    if (getRecent) {
      // Get the most recent reviews with limit
      const recentReviews = await createReviewQuery()
        .orderBy(desc(reviews.createdAt))
        .limit(limit)
        .all();
      
      return NextResponse.json(recentReviews);
    }
    
    // Search functionality
    if (searchQuery) {
      const searchPattern = `%${searchQuery}%`;
      
      // Get total count for pagination
      const totalCountResult = await db
        .select({ count: sql`count(*)` })
        .from(reviews)
        .leftJoin(users, eq(reviews.userId, users.id))
        .where(
          or(
            like(reviews.title, searchPattern),
            like(reviews.review, searchPattern),
            like(users.username, searchPattern),
            like(reviews.bookId, searchPattern)
          )
        );
      
      const totalCount = Number(totalCountResult[0].count);
      
      // Calculate offset for pagination
      const offset = (page - 1) * perPage;
      
      // Query reviews with pagination
      const searchResults = await createReviewQuery()
        .where(
          or(
            like(reviews.title, searchPattern),
            like(reviews.review, searchPattern),
            like(users.username, searchPattern),
            like(reviews.bookId, searchPattern)
          )
        )
        .limit(perPage)
        .offset(offset);
      
      return NextResponse.json({
        items: searchResults,
        totalItems: totalCount
      });
    }
    
    // Get current authenticated user's reviews (private, requires auth)
    if (!getAll && !userId) {
      if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const userReviews = await createReviewQuery()
        .where(eq(reviews.userId, parseInt(session.user.id)))
        .all();
      
      return NextResponse.json(userReviews);
    }
    
    // Get all reviews (public)
    if (getAll) {
      const allReviews = await createReviewQuery().all();
      return NextResponse.json(allReviews);
    }
    
    // Get reviews by specific user ID (public)
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
      { error: "Invalid request. Use 'all=true', 'userId=X', or 'q=search' parameters." },
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
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { bookId, bookTitle, rating, review, title } = await request.json();

    if (!bookId || !bookTitle) {
      return NextResponse.json(
        { error: "Book ID and Book Title are required" },
        { status: 400 }
      );
    }

    const userId = parseInt(session.user.id);
    const [newReview] = await db.insert(reviews)
      .values({
        userId: userId,
        bookId,
        bookTitle,
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
