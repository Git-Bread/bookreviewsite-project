'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/Header';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Check if the user is authenticated and is an admin
    if (status === 'unauthenticated' || (status === 'authenticated' && !session?.user?.admin)) {
      router.push('/');
    }
  }, [status, session, router]);

  // Show loading state or redirect if not admin
  if (status === 'loading' || status === 'unauthenticated' || !session?.user?.admin) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Admin Dashboard" />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Admin Dashboard</h1>
          
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <p className="text-gray-700 dark:text-gray-300">Welcome to the admin dashboard. This area is restricted to administrators only.</p>
            
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">User Management</h2>
                <p className="text-gray-600 dark:text-gray-400">Manage user accounts and permissions</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Review Management</h2>
                <p className="text-gray-600 dark:text-gray-400">Moderate user reviews and content</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}