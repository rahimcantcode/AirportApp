import React, { useMemo, useState } from 'react';
import { useApp } from '@/app/context/AppContext';
import { Search, Users, CheckCircle2 } from 'lucide-react';

export function BoardPassenger() {
  const { currentUser, flights, passengers, bags, updatePassenger, selectedGate, showBanner } = useApp();
  const [ticket, setTicket] = useState('');

  const selectedFlight = useMemo(() => {
    if (!selectedGate) return null;
    return flights.find(f => f.airlineCode === currentUser?.airline && f.gate === selectedGate) || null;
  }, [flights, currentUser, selectedGate]);

  const passenger = useMemo(() => {
    if (!selectedFlight || !ticket) return null;
    const p = passengers.find(x => x.ticketNumber === ticket && x.flightId === selectedFlight.id);
    return p || null;
  }, [passengers, selectedFlight, ticket]);

  const handleSearch = () => {
    if (!selectedGate) {
      showBanner('Select your gate first on the dashboard', 'error');
      return;
    }
    if (!ticket) {
      showBanner('Enter a ticket number', 'error');
      return;
    }
    if (!passenger) {
      showBanner('Passenger not found for this gate', 'error');
      return;
    }
    showBanner('Passenger loaded', 'success');
  };

  const handleBoard = () => {
    if (!passenger) return;
    if (passenger.status !== 'checked-in') {
      showBanner('Passenger must be checked in before boarding', 'error');
      return;
    }
    const passengerBags = bags.filter((b) => b.ticketNumber === passenger.ticketNumber);
    const notAtGate = passengerBags.find((b) => b.location !== 'gate');
    if (notAtGate) {
      showBanner('All passenger bags must be at gate before boarding', 'error');
      return;
    }
    updatePassenger({ ...passenger, status: 'boarded' });
  };

  if (!selectedFlight) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center text-gray-700">
          Select a gate on the dashboard before boarding passengers.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Board Passenger</h1>
        <p className="text-gray-500 mt-1">Gate {selectedFlight.gate} • Flight {selectedFlight.airlineCode} {selectedFlight.flightNumber}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={ticket}
            onChange={e => setTicket(e.target.value.trim())}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            placeholder="Enter ticket number"
          />
          <button
            onClick={handleSearch}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>

        {passenger && (
          <div className="mt-5 border border-gray-200 rounded-xl p-4 bg-gray-50">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="bg-gray-100 p-3 rounded-xl">
                  <Users className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{passenger.name}</p>
                  <p className="text-sm text-gray-600 mt-1">Ticket: {passenger.ticketNumber}</p>
                  <p className="text-sm text-gray-600 mt-1">Status: {passenger.status}</p>
                </div>
              </div>

              <button
                onClick={handleBoard}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800"
              >
                <CheckCircle2 className="w-4 h-4" />
                Board
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
