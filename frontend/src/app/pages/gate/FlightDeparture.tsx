import React, { useMemo, useState } from 'react';
import { useApp } from '@/app/context/AppContext';
import { PlaneTakeoff, Send } from 'lucide-react';

export function FlightDeparture() {
  const { currentUser, flights, selectedGate, addMessage, showBanner } = useApp();
  const [note, setNote] = useState('');

  const selectedFlight = useMemo(() => {
    if (!selectedGate) return null;
    return flights.find(f => f.airlineCode === currentUser?.airline && f.gate === selectedGate) || null;
  }, [flights, currentUser, selectedGate]);

  const informAdmin = () => {
    if (!selectedFlight) return;
    addMessage({
      board: 'admin',
      subject: 'Flight departure reported',
      content: note || 'Gate staff reported flight departure.',
      flightId: selectedFlight.id,
      severity: 'info',
      read: false,
    });
    showBanner('Admin informed about flight departure', 'success');
    setNote('');
  };

  if (!selectedFlight) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center text-gray-700">
          Select a gate on the dashboard before reporting departure.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Report Flight Departure</h1>
        <p className="text-gray-500 mt-1">Gate {selectedFlight.gate} • Flight {selectedFlight.airlineCode} {selectedFlight.flightNumber}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start gap-3">
          <div className="bg-gray-100 p-3 rounded-xl">
            <PlaneTakeoff className="w-6 h-6 text-gray-700" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">{selectedFlight.airlineCode} {selectedFlight.flightNumber}</p>
            <p className="text-sm text-gray-600 mt-1">Destination: {selectedFlight.destination}</p>
            <p className="text-sm text-gray-600 mt-1">Gate: {selectedFlight.gate}</p>
          </div>
        </div>

        <div className="mt-5">
          <label className="text-xs text-gray-600">Optional note to admin</label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            className="w-full mt-1 px-3 py-2 border rounded-xl min-h-[110px]"
            placeholder="Example: Boarding completed. Doors closed. Pushback scheduled."
          />
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={informAdmin}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800"
          >
            <Send className="w-4 h-4" />
            Inform Admin
          </button>
        </div>
      </div>
    </div>
  );
}
