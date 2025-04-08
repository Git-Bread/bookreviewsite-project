import React from 'react';

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
}

interface ReviewTableProps {
  reviews: Review[];
  reviewSearch: string;
  setReviewSearch: (search: string) => void;
  handleDeleteReview: (reviewId: number) => void;
}

// This component renders a table of reviews with search and delete functionalities, exports with function calls for the admin page
export default function ReviewTable({
  reviews,
  reviewSearch,
  setReviewSearch,
  handleDeleteReview
}: ReviewTableProps) {
  return (
    <>
      <div className="mb-4">
        <input type="text" placeholder="Search reviews by user, title, or book ID..."
          className="px-4 py-2 border rounded-md w-full md:w-96"
          value={reviewSearch} onChange={(e) => setReviewSearch(e.target.value)} />
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Book</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Book Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">No reviews found</td>
                </tr>
              ) : (
                reviews.map(review => (
                  <tr key={review.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{review.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{review.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{review.bookId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{review.bookTitle}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{review.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <span key={i} className="text-yellow-400">★</span>
                      ))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end">
                        <button onClick={() => handleDeleteReview(review.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}