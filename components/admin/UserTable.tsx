import { format } from 'date-fns';
import React from 'react';

interface User {
  id: number;
  username: string;
  admin: boolean;
  createdAt: string;
}

interface UserTableProps {
  users: User[];
  userSearch: string;
  setUserSearch: (search: string) => void;
  selectedUsers: Set<number>;
  deleteWithReviews: boolean;
  setDeleteWithReviews: (value: boolean) => void;
  toggleUserSelection: (userId: number) => void;
  deleteSelectedUsers: () => void;
  handleEditUser: (user: User) => void;
  handleToggleAdmin: (user: User) => void;
  handleDeleteUser: (userId: number) => void;
}

// This component renders a table of users with search, delete, and edit functionalities, exports with function calls for the admin page
export default function UserTable({
  users,
  userSearch,
  setUserSearch,
  selectedUsers,
  deleteWithReviews,
  setDeleteWithReviews,
  toggleUserSelection,
  deleteSelectedUsers,
  handleEditUser,
  handleToggleAdmin,
  handleDeleteUser
}: UserTableProps) {
  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div className="w-full md:w-auto">
          <input type="text" placeholder="Search users..." className="px-4 py-2 border rounded-md w-full md:w-64"
            value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
          <div className="flex items-center">
            <input type="checkbox" id="deleteWithReviews" className="mr-2"
              checked={deleteWithReviews} onChange={(e) => setDeleteWithReviews(e.target.checked)} />
            <label htmlFor="deleteWithReviews" className="text-sm text-gray-700 dark:text-gray-300">
              Delete user reviews
            </label>
          </div>
          
          {selectedUsers.size > 0 && (
            <button onClick={deleteSelectedUsers}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors">
              Delete Selected ({selectedUsers.size})
            </button>
          )}
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="w-12 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                  <span className="sr-only">Select</span>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Admin</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No users found</td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input type="checkbox" checked={selectedUsers.has(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{user.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{user.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {format(new Date(user.createdAt), 'PPP')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.admin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {user.admin ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => handleEditUser(user)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors">
                          Edit
                        </button>
                        <button onClick={() => handleToggleAdmin(user)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors">
                          {user.admin ? 'Remove Admin' : 'Make Admin'}
                        </button>
                        <button onClick={() => handleDeleteUser(user.id)}
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