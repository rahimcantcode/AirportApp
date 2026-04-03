import React, { useMemo } from 'react';
import { useApp } from '@/app/context/AppContext';
import { PackageCheck, MapPin } from 'lucide-react';

export function LoadBags() {
  const { groundMode, selectedGate, setGroundMode, bags, passengers, updateBag, flights, showBanner } = useApp();
  const [flightIdFilter, setFlightIdFilter] = React.useState('');

  const gateBags = useMemo(() => {
    if (!selectedGate) return [];
    const filtered = bags
      .filter(b => b.location === 'gate' && b.gate === selectedGate && !b.securityIssue)
      .sort((a, b) => a.bagId.localeCompare(b.bagId));

    if (!flightIdFilter.trim()) return filtered;
    return filtered.filter(b => b.flightId.toUpperCase() === flightIdFilter.trim().toUpperCase());
  }, [bags, selectedGate, flightIdFilter]);

  const selectedFlight = useMemo(() => {
    if (!selectedGate) return null;
    return flights.find(f => f.gate === selectedGate) || null;
  }, [flights, selectedGate]);

  const loadOne = (id: string) => {
    const bag = bags.find(b => b.id === id);
    if (!bag) return;
    if (!selectedGate || bag.gate !== selectedGate) {
      showBanner('You can only load bags for your selected gate', 'error');
      return;
    }
    const passenger = passengers.find((p) => p.ticketNumber === bag.ticketNumber);
    if (!passenger || passenger.status !== 'boarded') {
      showBanner('Cannot load bag until passenger is boarded', 'error');
      return;
    }
    updateBag({ ...bag, location: 'loaded', locationDetail: `Loaded at ${selectedGate}` });
  };

  if (groundMode !== 'gate-ops') {
    return (
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center text-gray-700">
          You are not assigned to Gate Ops right now.
          <div className="mt-4">
            <button
              onClick={() => { setGroundMode('gate-ops'); window.location.hash = 'ground-load'; }}
              className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800"
            >
              Switch to Gate Ops
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedGate) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center text-gray-700">
          Select a gate on the Ground Staff Dashboard before loading bags.
          <div className="mt-4">
            <button onClick={() => window.location.hash = 'ground-dashboard'} className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800">
              Go to dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Gate Ops Bag Loading</h1>
        <p className="text-gray-500 mt-1">Working gate {selectedGate}. Load bags one at a time.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 text-gray-800">
          <MapPin className="w-4 h-4 text-gray-600" />
          <span className="font-semibold">Gate</span> {selectedGate}
          {selectedFlight && (
            <span className="text-sm text-gray-600">• Flight {selectedFlight.airlineCode} {selectedFlight.flightNumber} to {selectedFlight.destination}</span>
          )}
        </div>
        <div className="mt-4">
          <label className="text-xs text-gray-600">Optional flight ID filter</label>
          <input
            value={flightIdFilter}
            onChange={(e) => setFlightIdFilter(e.target.value)}
            className="mt-1 w-full sm:w-72 px-3 py-2 border rounded-lg"
            placeholder="e.g., AA0108"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {gateBags.length === 0 ? (
          <div className="text-center py-10 text-gray-600">
            <PackageCheck className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            No bags ready to load for this gate. Make sure Security Clearance cleared bags to the gate.
          </div>
        ) : (
          <div className="space-y-3">
            {gateBags.map(bag => (
              <div key={bag.id} className="border border-gray-200 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">Bag {bag.bagId}</p>
                  <p className="text-sm text-gray-600 mt-1">Ticket {bag.ticketNumber} • Location: {bag.location} • {bag.locationDetail || bag.gate}</p>
                </div>

                <button
                  onClick={() => loadOne(bag.id)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800"
                >
                  <PackageCheck className="w-4 h-4" />
                  Load to plane
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
