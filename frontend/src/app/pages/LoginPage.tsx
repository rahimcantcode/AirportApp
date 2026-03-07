import React, { useState } from 'react';
import { useApp, UserRole, Staff } from '@/app/context/AppContext';
import { Plane } from 'lucide-react';

export function LoginPage() {
  const { setCurrentUser, staff, passengers, showBanner } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [passengerIdNumber, setPassengerIdNumber] = useState('');
  const [passengerTicketNumber, setPassengerTicketNumber] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      showBanner('Please enter username and password', 'error');
      return;
    }

    // Check admin login
    if (username === 'admin' && password === 'admin') {
      setCurrentUser({
        id: '0',
        username: 'admin',
        role: 'admin',
      });
      window.location.hash = 'admin-dashboard';
      return;
    }

    // Check staff login
    const foundStaff = staff.find(s => s.username === username && s.password === password);
    if (foundStaff) {
      setCurrentUser({
        id: foundStaff.id,
        username: foundStaff.username,
        role: foundStaff.role,
        airline: foundStaff.airline,
      });
      
      // Redirect to appropriate dashboard
      const dashboardMap: Record<string, string> = {
        'airline-staff': 'airline-dashboard',
        'gate-staff': 'gate-dashboard',
        'ground-staff': 'ground-dashboard',
      };
      window.location.hash = dashboardMap[foundStaff.role];
      return;
    }

    showBanner('Invalid username or password', 'error');
  };

  const handlePassengerLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!passengerIdNumber || !passengerTicketNumber) {
      showBanner('Please enter identification number and ticket number', 'error');
      return;
    }

    const foundPassenger = passengers.find(
      p => p.identificationNumber === passengerIdNumber && p.ticketNumber === passengerTicketNumber
    );

    if (foundPassenger) {
      setCurrentUser({
        id: foundPassenger.id,
        username: foundPassenger.name,
        role: 'passenger',
      });
      window.location.hash = 'passenger-track';
    } else {
      showBanner('Invalid identification or ticket number', 'error');
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setShowRoleSelection(false);
  };

  if (showRoleSelection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="flex items-center gap-3 mb-6">
            <Plane className="w-8 h-8 text-gray-700" />
            <h1 className="text-xl font-semibold text-gray-900">Select Your Role</h1>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleRoleSelect('admin')}
              className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 text-left"
            >
              <p className="font-medium text-gray-900">Administrator</p>
              <p className="text-sm text-gray-500">Manage flights, passengers, and staff</p>
            </button>

            <button
              onClick={() => handleRoleSelect('airline-staff')}
              className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 text-left"
            >
              <p className="font-medium text-gray-900">Airline Staff</p>
              <p className="text-sm text-gray-500">Check-in passengers and manage bags</p>
            </button>

            <button
              onClick={() => handleRoleSelect('gate-staff')}
              className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 text-left"
            >
              <p className="font-medium text-gray-900">Gate Staff</p>
              <p className="text-sm text-gray-500">Board passengers and manage departures</p>
            </button>

            <button
              onClick={() => handleRoleSelect('ground-staff')}
              className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 text-left"
            >
              <p className="font-medium text-gray-900">Ground Staff</p>
              <p className="text-sm text-gray-500">Update and load bags</p>
            </button>

            <button
              onClick={() => handleRoleSelect('passenger')}
              className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 text-left"
            >
              <p className="font-medium text-gray-900">Passenger</p>
              <p className="text-sm text-gray-500">Track bags and view gate information</p>
            </button>
          </div>

          <button
            onClick={() => setShowRoleSelection(false)}
            className="w-full mt-6 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (selectedRole === 'passenger') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="flex items-center gap-3 mb-6">
            <Plane className="w-8 h-8 text-gray-700" />
            <h1 className="text-xl font-semibold text-gray-900">Passenger Login</h1>
          </div>

          <form onSubmit={handlePassengerLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Identification Number
              </label>
              <input
                type="text"
                value={passengerIdNumber}
                onChange={(e) => setPassengerIdNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="Enter your ID number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ticket Number
              </label>
              <input
                type="text"
                value={passengerTicketNumber}
                onChange={(e) => setPassengerTicketNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="Enter your ticket number"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800"
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole(null)}
              className="w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
            >
              Back to Role Selection
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>Demo Credentials:</strong><br />
              ID: ID001, Ticket: TKT001
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="flex items-center gap-3 mb-6">
          <Plane className="w-8 h-8 text-gray-700" />
          <h1 className="text-xl font-semibold text-gray-900">Airport Luggage System</h1>
        </div>

        {!selectedRole ? (
          <div>
            <p className="text-gray-600 mb-6">Please select your role to continue</p>
            <button
              onClick={() => setShowRoleSelection(true)}
              className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800"
            >
              Select Role
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="mb-4 p-3 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600">
                Login as: <strong className="text-gray-900">
                  {selectedRole.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </strong>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="Enter password"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <a href="#password-reset" className="text-gray-600 hover:text-gray-900">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800"
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole(null)}
              className="w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
            >
              Change Role
            </button>
          </form>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            <strong>Demo Credentials:</strong><br />
            Admin: admin / admin<br />
            Staff: alice_aa / pass123
          </p>
        </div>
      </div>
    </div>
  );
}
