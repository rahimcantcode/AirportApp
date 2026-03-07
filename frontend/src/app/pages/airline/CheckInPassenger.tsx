import React, { useEffect, useMemo, useState } from 'react';
import { useApp, BagLocation } from '@/app/context/AppContext';
import { Search, Luggage, Plus, CheckCircle2 } from 'lucide-react';
import { Dialog } from '@/app/components/Dialog';

export function CheckInPassenger() {
  const { passengers, updatePassenger, flights, addBag, bags, currentUser, showBanner } = useApp();

  const [ticket, setTicket] = useState('');
  const [showBagDialog, setShowBagDialog] = useState(false);
  const [bagForm, setBagForm] = useState({ bagId: '', counter: 'T1-C05' });

  useEffect(() => {
    const saved = sessionStorage.getItem('airline:lastTicket');
    if (saved) setTicket(saved);
  }, []);

  const result = useMemo(() => {
    if (!ticket) return null;
    const passenger = passengers.find(p => p.ticketNumber === ticket);
    if (!passenger) return null;
    const flight = flights.find(f => f.id === passenger.flightId);
    if (!flight || flight.airlineCode !== currentUser?.airline) return null;
    const passengerBags = bags.filter(b => b.passengerId === passenger.id);
    return { passenger, flight, passengerBags };
  }, [ticket, passengers, flights, bags, currentUser]);

  const handleSearch = () => {
    if (!ticket) {
      showBanner('Enter a ticket number to search', 'error');
      return;
    }
    sessionStorage.setItem('airline:lastTicket', ticket);
    if (!result) {
      showBanner('No passenger found for this ticket under your airline', 'error');
      return;
    }
    showBanner('Passenger loaded', 'success');
  };

  const handleCheckInPassenger = () => {
    if (!result) return;
    if (result.passenger.status !== 'not-checked-in') {
      showBanner('Passenger is already checked in', 'error');
      return;
    }
    updatePassenger({ ...result.passenger, status: 'checked-in' });
  };

  const openBagDialog = () => {
    if (!result) return;
    if (result.passenger.status === 'not-checked-in') {
      showBanner('Check in the passenger before registering bags', 'error');
      return;
    }
    setBagForm({ bagId: '', counter: 'T1-C05' });
    setShowBagDialog(true);
  };

  const submitBag = () => {
    if (!result) return;
    const bagId = bagForm.bagId.trim();
    if (!bagId) {
      showBanner('Enter a bag ID', 'error');
      return;
    }

    const already = bags.some(b => b.bagId === bagId);
    if (already) {
      showBanner('Bag ID already exists', 'error');
      return;
    }

    addBag({
      id: Date.now().toString(),
      bagId,
      ticketNumber: result.passenger.ticketNumber,
      passengerId: result.passenger.id,
      flightId: result.flight.id,
      gate: result.flight.gate,
      location: 'check-in-counter' as BagLocation,
      locationDetail: bagForm.counter,
    });

    setShowBagDialog(false);
    showBanner('Bag registered at check-in counter', 'success');
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Check-in Passenger</h1>
        <p className="text-gray-500 mt-1">Search by ticket number, check in the passenger, then register bags one by one</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
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

        {result && (
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 border border-gray-200 rounded-xl p-4">
              <p className="text-sm text-gray-600">Passenger</p>
              <p className="font-semibold text-gray-900">{result.passenger.name}</p>
              <p className="text-sm text-gray-600 mt-1">
                Flight {result.flight.airlineCode} {result.flight.flightNumber} to {result.flight.destination}
              </p>
              <p className="text-sm text-gray-600 mt-1">Gate {result.flight.gate}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-sm text-gray-700">
                  Status: <span className="font-medium">{result.passenger.status}</span>
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-sm text-gray-700">
                  Bags: <span className="font-medium">{result.passengerBags.length}</span>
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={handleCheckInPassenger}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Check-in Passenger
                </button>

                <button
                  onClick={openBagDialog}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-100"
                >
                  <Plus className="w-4 h-4" />
                  Check-in Bag
                </button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Luggage className="w-5 h-5 text-gray-700" />
                <h3 className="font-semibold text-gray-900">Registered Bags</h3>
              </div>
              <div className="space-y-2">
                {result.passengerBags.map(bag => (
                  <div key={bag.id} className="bg-white border border-gray-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-900">Bag {bag.bagId}</p>
                    <p className="text-xs text-gray-600 mt-1">Location: {bag.location}{bag.locationDetail ? ` • ${bag.locationDetail}` : ''}</p>
                  </div>
                ))}
                {result.passengerBags.length === 0 && (
                  <p className="text-sm text-gray-600">No bags registered yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog
        isOpen={showBagDialog}
        onClose={() => setShowBagDialog(false)}
        title="Check-in Bag"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-600">Bag ID</label>
            <input
              value={bagForm.bagId}
              onChange={e => setBagForm(prev => ({ ...prev, bagId: e.target.value }))}
              className="w-full mt-1 px-3 py-2 border rounded-lg"
              placeholder="6-digit bag ID"
            />
          </div>

          <div>
            <label className="text-xs text-gray-600">Initial location</label>
            <input
              value={bagForm.counter}
              onChange={e => setBagForm(prev => ({ ...prev, counter: e.target.value }))}
              className="w-full mt-1 px-3 py-2 border rounded-lg"
              placeholder="Check-in counter (e.g., T1-C05)"
            />
            <p className="text-xs text-gray-500 mt-1">Location is set to Check-in counter, then routed through Security Clearance to the correct gate.</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowBagDialog(false)}
              className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={submitBag}
              className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800"
            >
              Register Bag
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
