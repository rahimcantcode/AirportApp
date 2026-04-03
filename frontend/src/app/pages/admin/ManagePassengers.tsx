import React, { useState } from 'react';
import { useApp } from '@/app/context/AppContext';
import { Plus, Trash2 } from 'lucide-react';
import { Dialog } from '@/app/components/Dialog';
import { ConfirmDialog } from '@/app/components/ConfirmDialog';

export function ManagePassengers() {
  const { passengers, addPassenger, removePassenger, flights } = useApp();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [selectedPassenger, setSelectedPassenger] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    ticketNumber: '',
    flightId: '',
    identificationNumber: '',
  });
  const [manualRemoveId, setManualRemoveId] = useState('');

  const handleAdd = () => {
    if (!formData.name || !formData.ticketNumber || !formData.flightId || !formData.identificationNumber) {
      return;
    }
    addPassenger({ ...formData, status: 'not-checked-in' });
    setFormData({ name: '', ticketNumber: '', flightId: '', identificationNumber: '' });
    setShowAddDialog(false);
  };

  const handleRemove = () => {
    if (selectedPassenger) {
      removePassenger(selectedPassenger);
      setSelectedPassenger(null);
    }
  };

  const getFlightInfo = (flightId: string) => {
    const flight = flights.find(f => f.id === flightId);
    return flight ? `${flight.airlineCode} ${flight.flightNumber}` : 'N/A';
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Manage Passengers</h1>
          <p className="text-gray-500 mt-1">Add, remove, or update passenger information</p>
        </div>
        <button
          onClick={() => setShowAddDialog(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
        >
          <Plus className="w-4 h-4" />
          Add Passenger
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Ticket Number</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Flight</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {passengers.map((passenger) => (
              <tr key={passenger.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{passenger.name}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{passenger.ticketNumber}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{getFlightInfo(passenger.flightId)}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                    passenger.status === 'not-checked-in' ? 'bg-gray-100 text-gray-800' :
                    passenger.status === 'checked-in' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {passenger.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => {
                      setSelectedPassenger(passenger.id);
                      setShowRemoveDialog(true);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Remove Passenger"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow border border-gray-200 p-4">
        <h2 className="font-semibold text-gray-900 mb-2">Remove by Ticket Number or Passenger ID</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={manualRemoveId}
            onChange={(e) => setManualRemoveId(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            placeholder="Enter ticket number or passenger ID"
          />
          <button
            onClick={() => {
              if (!manualRemoveId.trim()) return;
              const ok = window.confirm(`Remove passenger ${manualRemoveId.trim()} and related bags?`);
              if (!ok) return;
              removePassenger(manualRemoveId.trim());
              setManualRemoveId('');
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Add Passenger Dialog */}
      <Dialog isOpen={showAddDialog} onClose={() => setShowAddDialog(false)} title="Add Passenger">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Passenger Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              placeholder="Enter name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Number</label>
            <input
              type="text"
              value={formData.ticketNumber}
              onChange={(e) => setFormData({ ...formData, ticketNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              placeholder="e.g., TKT001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Identification Number</label>
            <input
              type="text"
              value={formData.identificationNumber}
              onChange={(e) => setFormData({ ...formData, identificationNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              placeholder="e.g., ID001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Flight</label>
            <select
              value={formData.flightId}
              onChange={(e) => setFormData({ ...formData, flightId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <option value="">Select a flight</option>
              {flights.map((flight) => (
                <option key={flight.id} value={flight.id}>
                  {flight.airlineCode} {flight.flightNumber} - Gate {flight.gate}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => setShowAddDialog(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              Add Passenger
            </button>
          </div>
        </div>
      </Dialog>

      {/* Remove Confirmation */}
      <ConfirmDialog
        isOpen={showRemoveDialog}
        onClose={() => setShowRemoveDialog(false)}
        onConfirm={handleRemove}
        title="Remove Passenger"
        message="Are you sure you want to remove this passenger? This action cannot be undone."
      />
    </div>
  );
}
