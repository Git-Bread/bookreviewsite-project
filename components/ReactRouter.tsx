'use client';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import HomePage from '@/app/page';
import AdminPage from '@/app/admin/page';
import MyReviewsPage from '@/app/myreviews/page';

const NotFoundPage = () => <div>404 - Not Found</div>;

// Protected route component that checks for authentication
const ProtectedRoute = ({ 
  children, 
  requireAdmin = false 
}: { 
  children: React.ReactNode, 
  requireAdmin?: boolean 
}) => {
  const { data: session, status } = useSession();
  
  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  const isAuthenticated = status === 'authenticated';
  const isAdmin = session?.user?.admin;
  
  // Redirect if not authenticated or if admin is required but user is not admin
  if (!isAuthenticated || (requireAdmin && !isAdmin)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export default function ReactRouter({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  // Only render on client-side to avoid SSR issues with React Router
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return null; // Return null on server-side
  }
  
  return (
    <BrowserRouter>
      <div className="w-full">
        <Routes>
          <Route path="/" element={<HomePage />} />
          
          {/* Protected routes */}
          <Route path="/myreviews" element={
            <ProtectedRoute>
              <MyReviewsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminPage />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}