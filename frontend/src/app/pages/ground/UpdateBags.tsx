import React, { useMemo } from 'react';
import { useApp } from '@/app/context/AppContext';
import { ShieldCheck, ArrowRight, AlertTriangle } from 'lucide-react';

export function UpdateBags() {
  const { groundMode, setGroundMode, bags, updateBag, addMessage, flights, passengers, showBanner } = useApp();
  const [bagIdInput, setBagIdInput] = React.useState('');
  const [statusInput, setStatusInput] = React.useState<'check-in-counter' | 'security-check' | 'gate' | 'loaded'>('security-check');

  const inboundBags = useMemo(() => {
    return bags
      .filter(b => b.location === 'check-in-counter' || b.location === 'security-check')
      .sort((a, b) => (a.location === 'check-in-counter' ? -1 : 1));
  }, [bags]);

  const flightById = useMemo(() => new Map(flights.map(f => [f.id, f])), [flights]);
  const passengerById = useMemo(() => new Map(passengers.map(p => [p.id, p])), [passengers]);

  const moveToSecurity = (bagId: string) => {
    const bag = bags.find(b => b.id === bagId);
    if (!bag) return;
    if (bag.location !== 'check-in-counter') {
      showBanner('Bag is not at check-in counter', 'error');
      return;
    }
    updateBag({ ...bag, location: 'security-check', locationDetail: 'Security Check', securityIssue: false });
  };

  const clearToGate = (bagId: string) => {
    const bag = bags.find(b => b.id === bagId);
    if (!bag) return;
    if (bag.location !== 'security-check') {
      showBanner('Move bag to Security Check before clearing to gate', 'error');
      return;
    }
    updateBag({ ...bag, location: 'gate', locationDetail: bag.gate, securityIssue: false });
  };

  const flagViolation = (bagId: string) => {
    const bag = bags.find(b => b.id === bagId);
    if (!bag) return;

    const passenger = passengerById.get(bag.passengerId);
    const flight = flightById.get(bag.flightId);

    // No change in location per requirement. Inform airline staff with Bag ID.
    addMessage({
      board: 'airline-staff',
      airline: flight?.airlineCode,
      subject: 'Security violation detected',
      content: 'Security clearance detected a violation. Bag should not proceed to gate.',
      bagId: bag.bagId,
      ticketNumber: bag.ticketNumber,
      passengerId: bag.passengerId,
      flightId: bag.flightId,
      severity: 'critical',
      read: false,
    });

    updateBag({ ...bag, securityIssue: true });
    showBanner('Airline staff informed. Bag location unchanged.', 'success');
  };

  if (groundMode !== 'security-clearance') {
    return (
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center text-gray-700">
          You are not assigned to Security Clearance right now.
          <div className="mt-4">
            <button
              onClick={() => { setGroundMode('security-clearance'); window.location.hash = 'ground-bags'; }}
              className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800"
            >
              Switch to Security Clearance
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Security Clearance</h1>
        <p className="text-gray-500 mt-1">Process bags arriving from check-in counters</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6 border border-gray-200 rounded-xl p-4 bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-2">Direct Bag Update by Bag ID</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              value={bagIdInput}
              onChange={e => setBagIdInput(e.target.value)}
              className="px-3 py-2 border rounded-lg"
              placeholder="Enter bag ID"
            />
            <select
              value={statusInput}
              onChange={e => setStatusInput(e.target.value as any)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="check-in-counter">check-in-counter</option>
              <option value="security-check">security-check</option>
              <option value="gate">gate</option>
              <option value="loaded">loaded</option>
            </select>
            <button
              onClick={() => {
                const bag = bags.find(b => b.bagId === bagIdInput.trim());
                if (!bag) {
                  showBanner('Bag ID not found', 'error');
                  return;
                }
                const detail = statusInput === 'gate' || statusInput === 'loaded' ? bag.gate : statusInput === 'security-check' ? 'Security Check' : bag.locationDetail;
                updateBag({ ...bag, location: statusInput, locationDetail: detail });
                showBanner(`Bag ${bag.bagId} updated to ${statusInput}`, 'success');
              }}
              className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
            >
              Update by ID
            </button>
          </div>
        </div>

        {inboundBags.length === 0 ? (
          <div className="text-center py-10 text-gray-600">
            <ShieldCheck className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            No bags waiting for security processing.
          </div>
        ) : (
          <div className="space-y-3">
            {inboundBags.map(bag => {
              const flight = flightById.get(bag.flightId);
              const passenger = passengerById.get(bag.passengerId);
              return (
                <div key={bag.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">Bag {bag.bagId}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Ticket {bag.ticketNumber} • Passenger {passenger?.name || 'Unknown'} • Flight {flight?.airlineCode} {flight?.flightNumber}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Current location: <span className="font-medium text-gray-800">{bag.location}</span>{bag.locationDetail ? ` • ${bag.locationDetail}` : ''}
                      </p>
                      {bag.securityIssue && (
                        <p className="text-sm text-red-700 mt-1 inline-flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Security issue flagged
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => moveToSecurity(bag.id)}
                        className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100"
                        disabled={bag.location !== 'check-in-counter'}
                      >
                        Check-in counter <ArrowRight className="inline w-4 h-4 ml-1" /> Security check
                      </button>

                      <button
                        onClick={() => clearToGate(bag.id)}
                        className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800"
                        disabled={bag.location !== 'security-check' || bag.securityIssue}
                      >
                        Clear to gate
                      </button>

                      <button
                        onClick={() => flagViolation(bag.id)}
                        className="px-4 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50"
                      >
                        Flag violation
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
