'use client';

interface BookListProps {
  books: any[];
}

export default function BookList({ books }: BookListProps) {

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Map through the books and display them in a grid layout, from Google Books API */}
      {books.map((book) => (
        <div key={book.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer bg-white dark:bg-gray-800">
          <div className="p-4 flex items-start">
            {/* Book cover image or placeholder from api */}
            {book.volumeInfo?.imageLinks?.thumbnail ? (
              <div className="flex-shrink-0 mr-4">
                <img src={book.volumeInfo.imageLinks.thumbnail} alt={book.volumeInfo.title} className="w-24 h-auto rounded"/>
              </div>
            ) : (
              <div className="flex-shrink-0 mr-4 w-24 h-36 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                <span className="text-gray-400 dark:text-gray-500">No image</span>
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{book.volumeInfo.title}</h3>
              
              {book.volumeInfo.authors && (
                <p className="text-sm text-gray-600 dark:text-gray-400">By {book.volumeInfo.authors.join(', ')}</p>
              )}
              
              {book.volumeInfo.publishedDate && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Published: {new Date(book.volumeInfo.publishedDate).getFullYear()}</p>
              )}
              
              <div className="mt-2">
                <button className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={(e) => {e.stopPropagation();}}>Write Review</button> {/* Only triggers button to stop refresh */}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}