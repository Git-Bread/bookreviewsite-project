import React from 'react';

interface UserEditForm {
  username: string;
  admin: boolean;
  password: string;
}

interface EditUserModalProps {
  userForm: UserEditForm;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmitEdit: (e: React.FormEvent) => void;
  handleCloseEditModal: () => void;
}

// This component renders a modal for editing user details, including username, password, and admin status
export default function EditUserModal({
  userForm,
  handleFormChange,
  handleSubmitEdit,
  handleCloseEditModal
}: EditUserModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Edit User</h3>
        
        <form onSubmit={handleSubmitEdit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
            <input type="text" id="username" name="username" value={userForm.username} onChange={handleFormChange}
              className="px-4 py-2 border rounded-md w-full" required />
          </div>
          
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Password (leave blank to keep current)
            </label>
            <input type="password" id="password" name="password" value={userForm.password} onChange={handleFormChange}
              className="px-4 py-2 border rounded-md w-full" minLength={8} />
            <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters</p>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center">
              <input type="checkbox" id="admin" name="admin" checked={userForm.admin} onChange={handleFormChange} className="mr-2" />
              <label htmlFor="admin" className="text-sm text-gray-700 dark:text-gray-300">Admin user</label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={handleCloseEditModal}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded text-sm font-medium transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}