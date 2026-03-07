import React, { useState } from 'react';
import { useApp } from '@/app/context/AppContext';
import { Plus, Trash2, Eye } from 'lucide-react';
import { Dialog } from '@/app/components/Dialog';
import { ConfirmDialog } from '@/app/components/ConfirmDialog';

export function ManageFlights() {
  const { flights, addFlight, removeFlight, passengers } = useApp();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showPassengersDialog, setShowPassengersDialog] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    airlineCode: '',
    flightNumber: '',
    gate: '',
  });

  const handleAdd = () => {
    if (!formData.airlineCode || !formData.flightNumber || !formData.gate) {
      return;
    }
    addFlight({ ...formData, status: 'scheduled' });
    setFormData({ airlineCode: '', flightNumber: '', gate: '' });
    setShowAddDialog(false);
  };

  const handleRemove = () => {
    if (selectedFlight) {
      removeFlight(selectedFlight);
      setSelectedFlight(null);
    }
  };

  const getFlightPassengers = (flightId: string) => {
    return passengers.filter(p => p.flightId === flightId);
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Manage Flights</h1>
          <p className="text-gray-500 mt-1">Add, remove, or view flight information</p>
        </div>
        <button
          onClick={() => setShowAddDialog(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
        >
          <Plus className="w-4 h-4" />
          Add Flight
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Airline Code</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Flight Number</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Gate</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {flights.map((flight) => (
              <tr key={flight.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{flight.airlineCode}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{flight.flightNumber}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{flight.gate}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                    flight.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    flight.status === 'boarding' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {flight.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedFlight(flight.id);
                        setShowPassengersDialog(true);
                      }}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                      title="View Passengers"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedFlight(flight.id);
                        setShowRemoveDialog(true);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Remove Flight"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Flight Dialog */}
      <Dialog isOpen={showAddDialog} onClose={() => setShowAddDialog(false)} title="Add Flight">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Airline Code</label>
            <input
              type="text"
              value={formData.airlineCode}
              onChange={(e) => setFormData({ ...formData, airlineCode: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              placeholder="e.g., AA"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Flight Number</label>
            <input
              type="text"
              value={formData.flightNumber}
              onChange={(e) => setFormData({ ...formData, flightNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              placeholder="e.g., 101"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gate</label>
            <input
              type="text"
              value={formData.gate}
              onChange={(e) => setFormData({ ...formData, gate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              placeholder="e.g., A1"
            />
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
              Add Flight
            </button>
          </div>
        </div>
      </Dialog>

      {/* Remove Confirmation */}
      <ConfirmDialog
        isOpen={showRemoveDialog}
        onClose={() => setShowRemoveDialog(false)}
        onConfirm={handleRemove}
        title="Remove Flight"
        message="Are you sure you want to remove this flight? This action cannot be undone."
      />

      {/* View Passengers Dialog */}
      <Dialog
        isOpen={showPassengersDialog}
        onClose={() => setShowPassengersDialog(false)}
        title="Flight Passengers"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          {selectedFlight && (
            <>
              <div className="text-sm text-gray-600 mb-4">
                Flight: {flights.find(f => f.id === selectedFlight)?.airlineCode} {flights.find(f => f.id === selectedFlight)?.flightNumber}
              </div>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Ticket</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {getFlightPassengers(selectedFlight).map((passenger) => (
                      <tr key={passenger.id}>
                        <td className="px-4 py-2 text-sm text-gray-900">{passenger.name}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{passenger.ticketNumber}</td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            passenger.status === 'not-checked-in' ? 'bg-gray-100 text-gray-800' :
                            passenger.status === 'checked-in' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {passenger.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </Dialog>
    </div>
  );
}
