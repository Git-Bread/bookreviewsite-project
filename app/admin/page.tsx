'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom'; // Import Navigate from react-router-dom
import Header from '@/components/Header';
import UserTable from '@/components/admin/UserTable';
import ReviewTable from '@/components/admin/ReviewTable';
import EditUserModal from '@/components/admin/EditUserModal';

// Define types for database entities
interface User {
  id: number;
  username: string;
  admin: boolean;
  createdAt: string;
}

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

interface UserEditForm {
  username: string;
  admin: boolean;
  password: string;
}

// Main component for the admin page
export default function AdminPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<'users' | 'reviews'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // States for user management
  const [userSearch, setUserSearch] = useState('');
  const [reviewSearch, setReviewSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [deleteWithReviews, setDeleteWithReviews] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState<UserEditForm>({ username: '', admin: false, password: '' });
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch data if authenticated
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.admin) {
      fetchData();
    }
  }, [status, session]);

  // Fetch users and reviews from the API
  const fetchData = async () => {
    setLoading(true);
    try {
      const [reviewsResponse, usersResponse] = await Promise.all([
        fetch('/api/reviews?all=true'),
        fetch('/api/users')
      ]);
      
      if (!reviewsResponse.ok) throw new Error('Failed to fetch reviews');
      if (!usersResponse.ok) throw new Error('Failed to fetch users');
      
      const [reviewsData, usersData] = await Promise.all([
        reviewsResponse.json(),
        usersResponse.json()
      ]);
      
      setReviews(reviewsData);
      setUsers(usersData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // User edit handlers
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({ username: user.username, admin: user.admin, password: '' });
    setShowEditModal(true);
  };

  // Close edit modal
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
  };

  // Handle form changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setUserForm({ ...userForm, [name]: type === 'checkbox' ? checked : value });
  };

  // Handle form submission for editing user
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    try {
      const updateData: any = {};
      if (userForm.username !== editingUser.username) updateData.username = userForm.username;
      if (userForm.admin !== editingUser.admin) updateData.admin = userForm.admin;
      if (userForm.password.trim()) updateData.password = userForm.password;
      
      if (Object.keys(updateData).length === 0) {
        handleCloseEditModal();
        return;
      }
      
      // Send PATCH request to update user
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) throw new Error('Failed to update user');
      
      // Update local state
      setUsers(users.map(u => 
        u.id === editingUser.id 
          ? { ...u, username: userForm.username || u.username, admin: userForm.admin } 
          : u
      ));
      
      // Update reviews if username changed
      if (userForm.username !== editingUser.username) {
        setReviews(reviews.map(review =>
          review.userId === editingUser.id
            ? { ...review, username: userForm.username }
            : review
        ));
      }
      
      handleCloseEditModal();
    } catch (err) {
      setError('Error updating user');
      console.error(err);
    }
  };

  // User deletion
  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      const url = deleteWithReviews ? `/api/users/${userId}?deleteReviews=true` : `/api/users/${userId}`;
      const response = await fetch(url, { method: 'DELETE' });
      
      if (!response.ok) throw new Error('Failed to delete user');
      
      setUsers(users.filter(user => user.id !== userId));
      if (deleteWithReviews) {
        setReviews(reviews.filter(review => review.userId !== userId));
      }
    } catch (err) {
      setError('Error deleting user');
      console.error(err);
    }
  };

  // Review deletion
  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) return;
    
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete review');
      
      setReviews(reviews.filter(review => review.id !== reviewId));
    } catch (err) {
      setError('Error deleting review');
      console.error(err);
    }
  };

  // Toggle admin status
  const handleToggleAdmin = async (user: User) => {
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin: !user.admin }),
      });
      
      if (!response.ok) throw new Error('Failed to update user');
      setUsers(users.map(u => u.id === user.id ? { ...u, admin: !u.admin } : u));
    } catch (err) {
      setError('Error updating user');
      console.error(err);
    }
  };
  
  // User selection
  const toggleUserSelection = (userId: number) => {
    const newSelectedUsers = new Set(selectedUsers);
    if (selectedUsers.has(userId)) newSelectedUsers.delete(userId);
    else newSelectedUsers.add(userId);
    setSelectedUsers(newSelectedUsers);
  };
  
  // Bulk delete
  const deleteSelectedUsers = async () => {
    if (selectedUsers.size === 0) return;
    if (!confirm(`Delete ${selectedUsers.size} selected user(s)?`)) return;
    
    setError(null);
    let errorCount = 0;
    
    for (const userId of selectedUsers) {
      try {
        const url = deleteWithReviews ? `/api/users/${userId}?deleteReviews=true` : `/api/users/${userId}`;
        const response = await fetch(url, { method: 'DELETE' });
        if (!response.ok) errorCount++;
      } catch (err) {
        errorCount++;
        console.error(`Error deleting user ${userId}:`, err);
      }
    }
    
    await fetchData();
    setSelectedUsers(new Set());
    
    if (errorCount > 0) {
      setError(`Failed to delete ${errorCount} user(s). Please try again.`);
    }
  };
  
  // Filter users and reviews
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(userSearch.toLowerCase())
  );
  const filteredReviews = reviews.filter(review => 
    review.username.toLowerCase().includes(reviewSearch.toLowerCase()) ||
    review.title.toLowerCase().includes(reviewSearch.toLowerCase()) ||
    review.bookId.toLowerCase().includes(reviewSearch.toLowerCase())
  );

  // Redirect if not admin
  if (status === 'unauthenticated' || (status === 'authenticated' && !session?.user?.admin)) {
    return <Navigate to="/" replace />;
  }

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Admin Dashboard" />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Admin Dashboard</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-4">
            <nav className="flex -mb-px">
              <button onClick={() => setActiveTab('users')} 
                className={`mr-8 py-2 px-1 ${activeTab === 'users' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                Users
              </button>
              <button onClick={() => setActiveTab('reviews')} 
                className={`py-2 px-1 ${activeTab === 'reviews' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                Reviews
              </button>
            </nav>
          </div>

          {loading ? (
            <div className="text-center py-4">Loading data...</div>
          ) : (
            <>
              {activeTab === 'users' && (
                <UserTable 
                  users={filteredUsers}
                  userSearch={userSearch}
                  setUserSearch={setUserSearch}
                  selectedUsers={selectedUsers}
                  deleteWithReviews={deleteWithReviews}
                  setDeleteWithReviews={setDeleteWithReviews}
                  toggleUserSelection={toggleUserSelection}
                  deleteSelectedUsers={deleteSelectedUsers}
                  handleEditUser={handleEditUser}
                  handleToggleAdmin={handleToggleAdmin}
                  handleDeleteUser={handleDeleteUser}
                />
              )}

              {activeTab === 'reviews' && (
                <ReviewTable
                  reviews={filteredReviews}
                  reviewSearch={reviewSearch}
                  setReviewSearch={setReviewSearch}
                  handleDeleteReview={handleDeleteReview}
                />
              )}
            </>
          )}
        </div>
      </main>

      {showEditModal && editingUser && (
        <EditUserModal
          userForm={userForm}
          handleFormChange={handleFormChange}
          handleSubmitEdit={handleSubmitEdit}
          handleCloseEditModal={handleCloseEditModal}
        />
      )}
    </div>
  );
}