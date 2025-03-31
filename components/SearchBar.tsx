'use client';

import { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  searchMode: 'books' | 'reviews';
  onToggleMode: () => void;
  isLoading: boolean;
}

const SearchBar = ({ onSearch, searchMode, onToggleMode, isLoading }: SearchBarProps) => {
  const [query, setQuery] = useState('');

  {/* Handle form submission and prevent page refresh */}
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-center mb-4">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button type="button" onClick={searchMode === 'reviews' ? onToggleMode : undefined}
          className={`px-4 py-2 text-sm font-medium rounded-l-lg ${searchMode === 'books' ? 'bg-blue-600 text-white' 
          : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'}`}>Search Books</button>
          <button type="button" onClick={searchMode === 'books' ? onToggleMode : undefined} 
          className={`px-4 py-2 text-sm font-medium rounded-r-lg ${searchMode === 'reviews' ? 'bg-blue-600 text-white'
          : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'}`}>Search Reviews</button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex items-center">
        <div className="relative w-full">
          <input type="text" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3 
          dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder={searchMode === 'books' ? "Search for books..." : "Search for reviews..."}
            value={query} onChange={(e) => setQuery(e.target.value)} required/>
        </div>
        <button type="submit" disabled={isLoading} className={`inline-flex items-center py-3 px-5 ml-2 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300'}`}>
          {/* Spinner icon when loading, gotten from ai, saves the time of searching for them and more efficient then using a icon font */}
          {isLoading ? (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-4 h-4 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
          )}
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>
    </div>
  );
};

export default SearchBar;