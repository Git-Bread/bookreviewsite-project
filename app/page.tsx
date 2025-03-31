'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import BookList from '@/components/BookList';

export default function Home() {
  const [searchMode, setSearchMode] = useState<'books' | 'reviews'>('books');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [books, setBooks] = useState([]);
  const [error, setError] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const ITEMS_PER_PAGE = 15;
  const handleSearch = async (query: string, page = 1) => {
    if (!query.trim()) return; // Ignore empty queries
    setSearchQuery(query); // set search query
    setIsSearching(true); // set loading state
    setError('');
    
    try {
      if (searchMode === 'books') {
        // Calculate start index based on page number, for pagination
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        
        // Search Google Books API with the start index and max results for pagination
        const response = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${ITEMS_PER_PAGE}&startIndex=${startIndex}`
        );
        
        // google api issues
        if (!response.ok) throw new Error('Failed to fetch books');
        
        const data = await response.json();
        setBooks(data.items || []);
        setTotalItems(data.totalItems || 0);
        setCurrentPage(page);
      } else {
        // Search internal reviews - TODO: Implement this or some variety of it
        const response = await fetch(`/api/reviews/search?q=${encodeURIComponent(query)}&page=${page}`);
        
        if (!response.ok) throw new Error('Failed to search reviews');
        setBooks([]);
      }

    // check for errors
    } catch (err) {
      console.error('Search error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to search for ${searchMode}: ${errorMessage}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    // Makes sure the page number is valid, needs to be above 0 and below the total number of pages
    if (newPage < 1 || newPage > Math.ceil(totalItems / ITEMS_PER_PAGE)) return;
    // Prevents unnecessary API calls if the page number is the same, gotta be nice to google sometimes
    if (newPage === currentPage) return;
    
    //does a search with the new page number
    handleSearch(searchQuery, newPage);
    
    // Scrolls to top when changing a page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // searchmode toggle with default to books
  const toggleSearchMode = () => {
    setSearchMode(prev => prev === 'books' ? 'reviews' : 'books');
    setBooks([]);
    setSearchQuery('');
    setCurrentPage(1);
    setTotalItems(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Book Reviews" />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 text-center">Find and Review Your Favorite Books</h1>
            <p className="text-xl text-gray-500 dark:text-gray-400 text-center mb-6">Discover new titles and share your opinions with our community</p>
            
            {/* Search component */}
            <SearchBar onSearch={(query) => handleSearch(query, 1)} // Reset to page 1 on new search
              searchMode={searchMode} onToggleMode={toggleSearchMode} isLoading={isSearching}/>
          </div>

          {/* Results section */}
          <div className="mt-8">
            {error && (<div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"><p>{error}</p></div>)}

            {/* Display search results with pagination info */}
            {searchQuery && !isSearching && books.length > 0 && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {searchMode === 'books' ? 'Book Results' : 'Review Results'}
                  </h2>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {totalItems > 0 ? (
                      <>
                        Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems > 10000 ? "way to many" : totalItems} results
                      </>
                    ) : (
                      `${books.length} results`
                    )}
                  </p>
                </div>
                
                <BookList books={books} />
                
                {/* Pagination controls */}
                {totalItems > ITEMS_PER_PAGE && (
                  <div className="flex justify-center mt-8">
                    <nav className="flex items-center">
                      <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} 
                      className="px-3 py-2 mr-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                      
                      <div className="flex">
                        {[...Array(Math.min(5, Math.ceil(totalItems / ITEMS_PER_PAGE)))].map((_, i) => {
                          let pageNum: number;
                          const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
                          
                          // Page number logic "sliding window"
                          if (currentPage <= 3) {
                            // Near start
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            // Near end
                            pageNum = totalPages - 4 + i;
                          } else {
                            // Middle
                            pageNum = currentPage - 2 + i;
                          }
                          
                          // Ensure page number is valid
                          if (pageNum < 1 || pageNum > totalPages) return null;
                          
                          return (
                            <button key={pageNum} onClick={() => handlePageChange(pageNum)} className={`px-3 py-2 mx-1 border rounded-md ${
                                currentPage === pageNum
                                  ? 'bg-blue-600 text-white'
                                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}>
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= Math.ceil(totalItems / ITEMS_PER_PAGE)} 
                        className="px-3 py-2 ml-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                    </nav>
                  </div>
                )}
              </>
            )}
            
            {/* No results message */}
            {searchQuery && !isSearching && books.length === 0 && !error && (
              <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">No results found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}