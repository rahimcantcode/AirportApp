import React, { useState } from 'react';
import { Plane, ArrowLeft } from 'lucide-react';
import { useApp } from '@/app/context/AppContext';
import { api } from '@/app/lib/api';

export function PasswordResetPage() {
  const { showBanner, currentUser } = useApp();
  const [username, setUsername] = useState(() => currentUser?.username || sessionStorage.getItem('password_reset_username') || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const required = sessionStorage.getItem('password_reset_required') === '1';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !currentPassword || !newPassword || !confirmPassword) {
      showBanner('Please fill in all fields', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showBanner('New password and confirmation do not match', 'error');
      return;
    }

    try {
      await api.changePassword({ username, currentPassword, newPassword });
      sessionStorage.removeItem('password_reset_required');
      sessionStorage.removeItem('password_reset_username');
      showBanner('Password updated successfully', 'success');
      window.location.hash = currentUser ? `${currentUser.role}-dashboard` : '';
    } catch (error) {
      showBanner(error instanceof Error ? error.message : 'Failed to reset password', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="flex items-center gap-3 mb-6">
          <Plane className="w-8 h-8 text-gray-700" />
          <h1 className="text-xl font-semibold text-gray-900">Reset Password</h1>
        </div>

        <p className="text-gray-600 mb-6">Change your password. It must include uppercase, lowercase, and a number.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              placeholder="Minimum 6 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              placeholder="Re-enter new password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800"
          >
            Update Password
          </button>

          {!required && (
            <a
              href={currentUser ? `#${currentUser.role}-dashboard` : '#'}
              className="flex items-center justify-center gap-2 w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </a>
          )}
        </form>
      </div>
    </div>
  );
}
