'use client';

// Next.js already provides a router, so this is the height of shitty code, but i specifically need a react router for this project so what can i do.
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import HomePage from '@/app/page';
import AdminPage from '@/app/admin/page';
import MyReviewsPage from '@/app/myreviews/page';

// Import or create these components for the routes
const NotFoundPage = () => <div>404 - Not Found</div>;

export default function ReactRouter({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

    // Only render on client-side to avoid SSR issues with React Next Router
    useEffect(() => {
      setIsMounted(true);
    }, []);
    
    if (!isMounted) {
      return null; // Return null on server-side
    }
  
  return (
    <BrowserRouter>
      {/* Routes only - Header is rendered elsewhere */}
      <div className="w-full">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/myreviews" element={<MyReviewsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}