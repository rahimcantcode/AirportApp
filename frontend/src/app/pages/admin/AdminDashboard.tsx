import React from 'react';
import { useApp } from '@/app/context/AppContext';
import { Plane, Users, UserCog, Plus } from 'lucide-react';

export function AdminDashboard() {
  const { flights, passengers, staff } = useApp();

  const stats = [
    {
      label: 'Total Flights',
      value: flights.length,
      icon: <Plane className="w-8 h-8 text-gray-600" />,
      action: 'Add Flight',
      href: '#admin-flights',
    },
    {
      label: 'Total Passengers',
      value: passengers.length,
      icon: <Users className="w-8 h-8 text-gray-600" />,
      action: 'Add Passenger',
      href: '#admin-passengers',
    },
    {
      label: 'Total Staff',
      value: staff.length,
      icon: <UserCog className="w-8 h-8 text-gray-600" />,
      action: 'Add Staff',
      href: '#admin-staff',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Administrator Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage flights, passengers, and staff</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-3xl font-semibold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                {stat.icon}
              </div>
            </div>
            <a
              href={stat.href}
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 font-medium"
            >
              <Plus className="w-4 h-4" />
              {stat.action}
            </a>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="#admin-flights"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50"
          >
            <h3 className="font-medium text-gray-900">Manage Flights</h3>
            <p className="text-sm text-gray-500 mt-1">Add, remove, or view flight details</p>
          </a>
          <a
            href="#admin-passengers"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50"
          >
            <h3 className="font-medium text-gray-900">Manage Passengers</h3>
            <p className="text-sm text-gray-500 mt-1">Add, remove, or update passenger information</p>
          </a>
          <a
            href="#admin-staff"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50"
          >
            <h3 className="font-medium text-gray-900">Manage Staff</h3>
            <p className="text-sm text-gray-500 mt-1">Add or remove airline, gate, and ground staff</p>
          </a>
        </div>
      </div>
    </div>
  );
}
