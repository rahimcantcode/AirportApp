import React, { useMemo } from 'react';
import { useApp } from '@/app/context/AppContext';
import { Inbox, CheckCircle2, UserX, PlaneTakeoff, AlertTriangle } from 'lucide-react';

function SeverityIcon({ severity }: { severity: 'info' | 'warning' | 'critical' }) {
  if (severity === 'critical') return <AlertTriangle className="w-4 h-4 text-red-600" />;
  if (severity === 'warning') return <AlertTriangle className="w-4 h-4 text-amber-600" />;
  return <Inbox className="w-4 h-4 text-gray-600" />;
}

export function AdminMessages() {
  const { messages, passengers, flights, removePassenger, markMessageRead, showBanner } = useApp();

  const boardMessages = useMemo(() => {
    return messages
      .filter((m) => m.board === 'admin')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [messages]);

  const handleRemovePassenger = (passengerId?: string) => {
    if (!passengerId) return;

    const passenger = passengers.find((p) => p.id === passengerId);
    const name = passenger?.name || 'this passenger';

    const ok = window.confirm(`Remove ${name} (and all associated bags) from the system?`);
    if (!ok) return;

    removePassenger(passengerId);
    showBanner('Passenger removed successfully', 'success');
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Admin Inbox</h1>
        <p className="text-gray-500 mt-1">Operational requests from staff, including passenger removals and flight departures.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {boardMessages.length === 0 ? (
          <div className="text-center py-10">
            <Inbox className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No messages yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {boardMessages.map((m) => {
              const passenger = m.passengerId ? passengers.find((p) => p.id === m.passengerId) : undefined;
              const flight = m.flightId ? flights.find((f) => f.id === m.flightId) : undefined;

              const isDepartureNotice =
                m.subject.toLowerCase().includes('departure') || m.subject.toLowerCase().includes('depart');

              return (
                <div
                  key={m.id}
                  className={`border rounded-xl p-4 ${m.read ? 'border-gray-200 bg-white' : 'border-gray-300 bg-gray-50'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {isDepartureNotice ? (
                          <PlaneTakeoff className="w-4 h-4 text-blue-600" />
                        ) : (
                          <SeverityIcon severity={m.severity} />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{m.subject}</p>
                          {!m.read && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-900 text-white">New</span>}
                        </div>

                        <p className="text-sm text-gray-700 mt-1">{m.content}</p>

                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
                          {m.ticketNumber && <span className="px-2 py-1 rounded-full bg-gray-100 border">Ticket: {m.ticketNumber}</span>}
                          {m.bagId && <span className="px-2 py-1 rounded-full bg-gray-100 border">Bag ID: {m.bagId}</span>}
                          {passenger && <span className="px-2 py-1 rounded-full bg-gray-100 border">Passenger: {passenger.name}</span>}
                          {flight && (
                            <span className="px-2 py-1 rounded-full bg-gray-100 border">
                              Flight: {flight.airlineCode}
                              {flight.flightNumber} at {flight.gate}
                            </span>
                          )}
                          <span className="px-2 py-1 rounded-full bg-gray-100 border">{m.timestamp.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => markMessageRead(m.id, true)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-700"
                      title="Mark as read"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Read
                    </button>
                  </div>

                  {m.passengerId && (m.severity === 'critical' || m.severity === 'warning') && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleRemovePassenger(m.passengerId)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-800"
                      >
                        <UserX className="w-4 h-4" />
                        Remove passenger from system
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
