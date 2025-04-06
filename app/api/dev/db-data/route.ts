// IMPORTANT: REMOVE THIS FILE BEFORE DEPLOYMENT

import { NextResponse } from 'next/server';
import db from '@/db';
import { users, reviews } from '@/db/schema';

export async function GET() {
  try {
    const allUsers = await db.select().from(users);
    const allReviews = await db.select().from(reviews);
    
    return NextResponse.json({
      users: allUsers,
      reviews: allReviews
    });
  } catch (error) {
    console.error('Database query error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch database data', details: String(error) }, 
      { status: 500 }
    );
  }
}