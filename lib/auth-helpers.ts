'use client';

import { signOut as nextAuthSignOut } from 'next-auth/react';

export async function handleLogout() {
  try {
    // 1. Call server-side logout endpoint to clear cookies
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    
    // 4. Use NextAuth's signOut to clear client-side session
    return nextAuthSignOut({
      callbackUrl: '/',
      redirect: true,
    });
    
    // Fallback to basic signOut if the full process fails
  } catch (error) {
    console.error('Logout error:', error);
    return nextAuthSignOut({ callbackUrl: '/' });
  }
}