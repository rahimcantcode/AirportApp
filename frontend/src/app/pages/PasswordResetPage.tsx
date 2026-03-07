import React, { useState } from 'react';
import { Plane, ArrowLeft } from 'lucide-react';
import { useApp } from '@/app/context/AppContext';

export function PasswordResetPage() {
  const { showBanner } = useApp();
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) {
      showBanner('Please enter your username', 'error');
      return;
    }
    showBanner('Password reset instructions sent to your email', 'success');
    setTimeout(() => {
      window.location.hash = '';
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="flex items-center gap-3 mb-6">
          <Plane className="w-8 h-8 text-gray-700" />
          <h1 className="text-xl font-semibold text-gray-900">Reset Password</h1>
        </div>

        <p className="text-gray-600 mb-6">
          Enter your username and we'll send you instructions to reset your password.
        </p>

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

          <button
            type="submit"
            className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800"
          >
            Send Reset Instructions
          </button>

          <a
            href="#"
            className="flex items-center justify-center gap-2 w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </a>
        </form>
      </div>
    </div>
  );
}
