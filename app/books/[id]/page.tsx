'use client';

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import Header from '@/components/Header';
import ReviewModal from '@/components/ReviewModal';

interface Review {
  id: number;
  userId: number;
  username: string;
  bookId: string;
  title: string;
  rating: number;
  review: string;
  createdAt: string;
  updatedAt: string;
}

interface BookDetails {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    publishedDate?: string;
    pageCount?: number;
    categories?: string[];
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    publisher?: string;
    industryIdentifiers?: {
      type: string;
      identifier: string;
    }[];
  };
}

export default function BookDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: session } = useSession();
  
  const [book, setBook] = useState<BookDetails | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  // Fetch book details and reviews
  useEffect(() => {
    const fetchBookAndReviews = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch book details from Google Books API
        const bookResponse = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`);
        
        if (!bookResponse.ok) {
          throw new Error('Failed to fetch book details');
        }
        
        const bookData = await bookResponse.json();
        setBook(bookData);
        
        // Fetch reviews for this book from our API
        const reviewsResponse = await fetch(`/api/reviews?q=${id}`);
        
        if (!reviewsResponse.ok) {
          throw new Error('Failed to fetch reviews');
        }
        
        const reviewsData = await reviewsResponse.json();
        setReviews(reviewsData.items || []);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load book information. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchBookAndReviews();
    }
  }, [id]);
  
  const handleAddReview = () => {
    if (!session) {
      // Consider redirecting to login or showing login modal
      alert('Please log in to write a review');
      return;
    }
    
    setShowReviewModal(true);
  };
  
  const closeReviewModal = () => {
    setShowReviewModal(false);
  };
  
  const handleReviewSubmitted = async () => {
    // Refetch reviews to include the new one
    try {
      const reviewsResponse = await fetch(`/api/reviews?q=${id}`);
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        setReviews(reviewsData.items || []);
      }
    } catch (err) {
      console.error('Error refreshing reviews:', err);
    }
    
    setShowReviewModal(false);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return dateString;
    }
  };
  
  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 'No ratings yet';
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header title="Book Details" />
        <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </main>
      </div>
    );
  }
  
  if (error || !book) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header title="Book Details" />
        <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{error || 'Failed to load book'}</p>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Search
          </button>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Book Details" />
      
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex flex-col md:flex-row">
            {/* Book Image */}
            <div className="flex-shrink-0 mr-6 mb-4 md:mb-0">
              {book.volumeInfo?.imageLinks?.thumbnail ? (
                <img 
                  src={book.volumeInfo.imageLinks.thumbnail.replace('http:', 'https:')} 
                  alt={book.volumeInfo.title} 
                  className="w-40 h-auto shadow-md rounded"
                />
              ) : (
                <div className="w-40 h-56 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded">
                  <span className="text-gray-500 dark:text-gray-400">No image</span>
                </div>
              )}
              
              <div className="mt-4">
                <button 
                  onClick={handleAddReview}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm focus:outline-none"
                >
                  Write a Review
                </button>
              </div>
            </div>
            
            {/* Book Details */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {book.volumeInfo.title}
              </h1>
              
              {book.volumeInfo.authors && (
                <p className="mt-1 text-gray-600 dark:text-gray-300">
                  By {book.volumeInfo.authors.join(', ')}
                </p>
              )}
              
              <div className="mt-4 flex items-center">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.round(Number(averageRating)) ? "text-yellow-400" : "text-gray-300"}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  {averageRating} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {book.volumeInfo.publishedDate && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Published: </span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {book.volumeInfo.publishedDate}
                    </span>
                  </div>
                )}
                
                {book.volumeInfo.publisher && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Publisher: </span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {book.volumeInfo.publisher}
                    </span>
                  </div>
                )}
                
                {book.volumeInfo.pageCount && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Pages: </span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {book.volumeInfo.pageCount}
                    </span>
                  </div>
                )}
                
                {book.volumeInfo.categories && book.volumeInfo.categories.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Categories: </span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {book.volumeInfo.categories.join(', ')}
                    </span>
                  </div>
                )}
              </div>
              
              {book.volumeInfo.description && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Description</h3>
                  <div 
                    className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-5"
                    dangerouslySetInnerHTML={{ __html: book.volumeInfo.description }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Reviews Section */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Reviews ({reviews.length})
          </h2>
          
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {review.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          By {review.username} · {formatDate(review.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-300"}>
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                          {review.rating}/5
                        </span>
                      </div>
                    </div>
                    <p className="mt-3 text-gray-600 dark:text-gray-300">
                      {review.review}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No reviews yet. Be the first to review this book!
              </p>
              <button 
                onClick={handleAddReview}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md focus:outline-none"
              >
                Write a Review
              </button>
            </div>
          )}
        </div>
      </main>
      
      {/* Review Modal */}
      {showReviewModal && book && (
        <ReviewModal 
          book={book} 
          isOpen={showReviewModal} 
          onClose={closeReviewModal} 
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
}