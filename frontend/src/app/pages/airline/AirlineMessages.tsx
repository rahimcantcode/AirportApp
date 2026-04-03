import React, { useMemo } from 'react';
import { useApp } from '@/app/context/AppContext';
import { AlertTriangle, Inbox, CheckCircle2, Trash2, UserX } from 'lucide-react';

export function AirlineMessages() {
  const { currentUser, messages, bags, passengers, removeBag, removeBagsByPassenger, markMessageRead, addMessage } = useApp();

  const boardMessages = useMemo(() => {
    return messages
      .filter(m => m.board === 'airline-staff' && m.airline === currentUser?.airline)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [messages, currentUser]);

  const severityIcon = (sev: string) => {
    if (sev === 'critical') return <AlertTriangle className="w-4 h-4 text-red-600" />;
    if (sev === 'warning') return <AlertTriangle className="w-4 h-4 text-amber-600" />;
    return <Inbox className="w-4 h-4 text-gray-600" />;
  };

  const handleRemoveBag = (bagId?: string) => {
    if (!bagId) return;
    const bag = bags.find(b => b.bagId === bagId);
    if (!bag) return;
    removeBag(bag.id);
  };

  const requestAdminRemoval = (passengerId?: string, ticketNumber?: string, bagId?: string) => {
    if (!passengerId) return;
    const ok = window.confirm('Remove all bags for this passenger and request admin passenger removal?');
    if (!ok) return;

    removeBagsByPassenger(passengerId);
    addMessage({
      board: 'admin',
      subject: 'Removal request from airline staff',
      content: `Security violation flow completed: all bags removed for passenger. Requesting admin removal.`,
      passengerId,
      ticketNumber,
      bagId,
      severity: 'warning',
      read: false,
    });
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Airline Message Board</h1>
        <p className="text-gray-500 mt-1">Security violations and operational notices. Messages must include Bag ID when applicable.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {boardMessages.length === 0 ? (
          <div className="text-center py-10">
            <Inbox className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No messages yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {boardMessages.map(m => {
              const passenger = m.passengerId ? passengers.find(p => p.id === m.passengerId) : undefined;

              return (
                <div
                  key={m.id}
                  className={`border rounded-xl p-4 ${m.read ? 'border-gray-200 bg-white' : 'border-gray-300 bg-gray-50'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{severityIcon(m.severity)}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{m.subject}</p>
                          {!m.read && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-900 text-white">New</span>}
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{m.content}</p>

                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
                          {m.bagId && <span className="px-2 py-1 rounded-full bg-gray-100 border">Bag ID: {m.bagId}</span>}
                          {m.ticketNumber && <span className="px-2 py-1 rounded-full bg-gray-100 border">Ticket: {m.ticketNumber}</span>}
                          {passenger && <span className="px-2 py-1 rounded-full bg-gray-100 border">Passenger: {passenger.name}</span>}
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

                  {(m.severity === 'critical' || m.severity === 'warning') && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleRemoveBag(m.bagId)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-800"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove bag from system
                      </button>

                      <button
                        onClick={() => requestAdminRemoval(m.passengerId, m.ticketNumber, m.bagId)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-800"
                      >
                        <UserX className="w-4 h-4" />
                        Remove bags + inform admin
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
