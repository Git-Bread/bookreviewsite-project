'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';

export default function MyReviewsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push('/');
    }
    
    // Fetch user's reviews when authenticated
    if (status === 'authenticated') {
      const fetchReviews = async () => {
        try {
          setIsLoading(true);
          const response = await fetch('/api/reviews');
          if (!response.ok) throw new Error('Failed to fetch reviews');
          const data = await response.json();
          setReviews(data);
        } catch (error) {
          console.error('Error fetching reviews:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchReviews();
    }
  }, [status, router]);

  if (status === 'loading' || (status === 'unauthenticated')) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="My Reviews" />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">My Reviews</h1>
          
          {isLoading ? (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">Loading your reviews...</p>
            </div>
          ) : reviews.length > 0 ? (
            <div className="grid gap-6">
              {/* Reviews will be displayed here */}
              <p className="text-gray-700 dark:text-gray-300">You have {reviews.length} reviews</p>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">You haven't written any reviews yet</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}