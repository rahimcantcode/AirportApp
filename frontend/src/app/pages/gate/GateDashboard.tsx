import React, { useMemo } from 'react';
import { useApp } from '@/app/context/AppContext';
import { Plane, Users, MapPin } from 'lucide-react';

export function GateDashboard() {
  const { currentUser, flights, passengers, selectedGate, setSelectedGate, showBanner } = useApp();

  const airlineFlights = useMemo(
    () => flights.filter(f => f.airlineCode === currentUser?.airline),
    [flights, currentUser]
  );

  const selectedFlight = useMemo(
    () => airlineFlights.find(f => f.gate === selectedGate) || null,
    [airlineFlights, selectedGate]
  );

  const flightPassengers = useMemo(() => {
    if (!selectedFlight) return [];
    return passengers.filter(p => p.flightId === selectedFlight.id);
  }, [passengers, selectedFlight]);

  const checkedIn = flightPassengers.filter(p => p.status === 'checked-in' || p.status === 'boarded').length;
  const boarded = flightPassengers.filter(p => p.status === 'boarded').length;

  const requireGate = () => {
    if (!selectedGate) {
      showBanner('Select a gate to begin work. Staff can only work one gate at a time.', 'error');
      return false;
    }
    return true;
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Gate Staff Dashboard</h1>
        <p className="text-gray-500 mt-1">Select a gate, then manage boarding and departures for that flight</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">Choose gate to work</h2>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <select
            value={selectedGate || ''}
            onChange={e => setSelectedGate(e.target.value || null)}
            className="w-full sm:w-72 px-3 py-2 border rounded-xl"
          >
            <option value="">Select gate</option>
            {airlineFlights.map(f => (
              <option key={f.id} value={f.gate}>{f.gate} • {f.airlineCode} {f.flightNumber}</option>
            ))}
          </select>

          {selectedFlight && (
            <div className="text-sm text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-600" />
              Working gate <span className="font-semibold">{selectedFlight.gate}</span> for flight {selectedFlight.airlineCode} {selectedFlight.flightNumber} to {selectedFlight.destination}
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">Gate selection restricts all actions to this gate to prevent incorrect boarding or loading.</p>
      </div>

      {!selectedFlight ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center text-gray-600">
          Select a gate to view passengers and proceed.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Passengers</p>
                <p className="text-3xl font-semibold text-gray-900 mt-1">{flightPassengers.length}</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-xl">
                <Users className="w-8 h-8 text-gray-700" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">Checked-in: {checkedIn} • Boarded: {boarded}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-3 rounded-xl">
                <Plane className="w-6 h-6 text-gray-700" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{selectedFlight.airlineCode} {selectedFlight.flightNumber}</p>
                <p className="text-sm text-gray-600">Destination: {selectedFlight.destination}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
              {flightPassengers.map(p => (
                <div key={p.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <p className="font-medium text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-600 mt-1">Ticket: {p.ticketNumber}</p>
                  <p className="text-xs text-gray-600 mt-1">Status: {p.status}</p>
                </div>
              ))}
              {flightPassengers.length === 0 && (
                <div className="text-sm text-gray-600">No passengers found for this flight.</div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <button
                onClick={() => { if (requireGate()) window.location.hash = 'gate-boarding'; }}
                className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800"
              >
                Board passenger
              </button>
              <button
                onClick={() => { if (requireGate()) window.location.hash = 'gate-departure'; }}
                className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100"
              >
                Report flight departure
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
