import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import { useNavigate } from 'react-router-dom';

interface Review {
  id: number;
  userId: number;
  username: string;
  bookId: string;
  bookTitle: string;
  title: string;
  rating: number;
  review: string;
  createdAt: string;
  updatedAt: string;
}

interface ReviewListProps {
  reviews: Review[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
  const { data: session } = useSession();
  const navigate = useNavigate();
  
  const handleNavigateToBook = (bookId: string) => {
    navigate(`/books/${bookId}`);
  };
  
  // Helper function to format dates safely
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return dateString;
    }
  };
  
  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div 
          key={review.id} 
          className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg cursor-pointer transition-shadow hover:shadow-lg" 
          onClick={() => handleNavigateToBook(review.bookId)}
        >
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{review.title}</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">By {review.username}</p>
                <p className="mt-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                  Book: {review.bookTitle}
                </p>
              </div>
              <div className="flex items-center">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-300"}>★</span>
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">{review.rating}/5</span>
              </div>
            </div>
            
            <p className="mt-3 text-base text-gray-700 dark:text-gray-300">{review.review}</p>
            
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {review.updatedAt !== review.createdAt ? 
                `Updated on ${formatDate(review.updatedAt)}` : 
                `Posted on ${formatDate(review.createdAt)}`}
            </p>
          </div>
        </div>
      ))}
      
      {reviews.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">No reviews found</p>
        </div>
      )}
    </div>
  );
}