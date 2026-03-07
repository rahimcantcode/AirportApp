import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '@/app/context/AppContext';
import { Plane, Search, ArrowRight } from 'lucide-react';

export function AirlineDashboard() {
  const { currentUser, flights, passengers, bags, showBanner } = useApp();
  const [ticket, setTicket] = useState('');

  useEffect(() => {
    const saved = sessionStorage.getItem('airline:lastTicket');
    if (saved) setTicket(saved);
  }, []);

  const airlineFlights = useMemo(
    () => flights.filter(f => f.airlineCode === currentUser?.airline),
    [flights, currentUser]
  );

  const searchResult = useMemo(() => {
    if (!ticket) return null;
    const passenger = passengers.find(p => p.ticketNumber === ticket);
    if (!passenger) return null;
    const flight = flights.find(f => f.id === passenger.flightId);
    if (!flight || flight.airlineCode !== currentUser?.airline) return null;
    const passengerBags = bags.filter(b => b.passengerId === passenger.id);
    return { passenger, flight, passengerBags };
  }, [ticket, passengers, flights, bags, currentUser]);

  const goToCheckIn = () => {
    if (!ticket) return;
    sessionStorage.setItem('airline:lastTicket', ticket);
    window.location.hash = 'airline-checkin';
  };

  const handleSearchClick = () => {
    if (!ticket) {
      showBanner('Enter a ticket number to search', 'error');
      return;
    }
    if (!searchResult) {
      showBanner('No passenger found for this ticket under your airline', 'error');
      return;
    }
    showBanner('Passenger found. Continue to check-in.', 'success');
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Airline Staff Console</h1>
        <p className="text-gray-500 mt-1">Search tickets, check in passengers, and register bags</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">Ticket Search</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={ticket}
            onChange={e => setTicket(e.target.value.trim())}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            placeholder="Enter ticket number"
          />
          <button
            onClick={handleSearchClick}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>

        {searchResult && (
          <div className="mt-5 border border-gray-200 rounded-xl p-4 bg-gray-50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-sm text-gray-600">Passenger</p>
                <p className="font-semibold text-gray-900">{searchResult.passenger.name}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Flight {searchResult.flight.airlineCode} {searchResult.flight.flightNumber} to {searchResult.flight.destination} • Gate {searchResult.flight.gate}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Status: <span className="font-medium text-gray-800">{searchResult.passenger.status}</span> • Bags registered: {searchResult.passengerBags.length}
                </p>
              </div>

              <button
                onClick={goToCheckIn}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-100"
              >
                Go to Check-in
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Flights for {currentUser?.airline}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {airlineFlights.map(flight => (
            <div key={flight.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-3 rounded-xl">
                  <Plane className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{flight.airlineCode} {flight.flightNumber}</p>
                  <p className="text-sm text-gray-600">Destination: {flight.destination}</p>
                  <p className="text-sm text-gray-600">Gate: {flight.gate}</p>
                </div>
              </div>
            </div>
          ))}
          {airlineFlights.length === 0 && (
            <div className="text-sm text-gray-500">No flights configured for this airline.</div>
          )}
        </div>
      </div>
    </div>
  );
}
