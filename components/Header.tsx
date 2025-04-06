'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import LoginModal from './LoginModal';
import { Link as RouterLink } from 'react-router-dom';

interface HeaderProps {
  title: string;
}

const Header = ({ title }: HeaderProps) => {
  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  
  // Get session data (logged in status)
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  // Logourt function, builds on NextAuth signOut function
  const logoutUser = async () => {
    try {
      await signOut({ redirect: false });
      window.location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <div className="flex-shrink-0">
          <Link href="/" className="text-xl font-bold text-gray-800 dark:text-white">{title}</Link>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* User is logged in */}
          {isAuthenticated ? (
            <>
              <span className="text-gray-700 dark:text-gray-300">{session?.user?.name || 'User'}</span>
              <button onClick={logoutUser} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Logout</button>
            </>
          ) : (
            /* User is not logged in */
            <button onClick={openModal} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
            Login</button>
          )}
        </div>
      </div>
      
      {/* Navigation bar */}
      {isAuthenticated && (
      <nav className="bg-blue-200 p-3 ml-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-6">
          <RouterLink to="/" className="font-bold hover:underline">Home</RouterLink>
          <RouterLink to="/myreviews" className="font-bold hover:underline">My Reviews</RouterLink>
          {session?.user?.admin && (
            <RouterLink to="/admin" className="font-bold hover:underline">Admin</RouterLink>
          )}
        </div>
      </nav>
      )}
      
      {/* Modal for login, with close function passed as a prop */}
      {isModalOpen && <LoginModal onClose={closeModal} />}
    </header>
  );
};

export default Header;