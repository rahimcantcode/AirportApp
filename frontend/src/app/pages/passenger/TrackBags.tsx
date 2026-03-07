import React, { useMemo } from 'react';
import { useApp } from '@/app/context/AppContext';
import { Luggage, Circle, CheckCircle2, ShieldCheck, MapPin, Plane } from 'lucide-react';

const steps = [
  { key: 'check-in-counter', label: 'Check-in counter', icon: <Luggage className="w-4 h-4" /> },
  { key: 'security-check', label: 'Security check', icon: <ShieldCheck className="w-4 h-4" /> },
  { key: 'gate', label: 'Gate', icon: <MapPin className="w-4 h-4" /> },
  { key: 'loaded', label: 'Loaded on plane', icon: <Plane className="w-4 h-4" /> },
] as const;

export function TrackBags() {
  const { currentUser, bags, flights } = useApp();

  const passengerBags = useMemo(() => {
    if (!currentUser) return [];
    return bags.filter(b => b.passengerId === currentUser.id);
  }, [bags, currentUser]);

  const flight = useMemo(() => {
    if (!passengerBags[0]) return null;
    return flights.find(f => f.id === passengerBags[0].flightId) || null;
  }, [passengerBags, flights]);

  const stepIndex = (loc: string) => steps.findIndex(s => s.key === loc);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Track Bags</h1>
        <p className="text-gray-500 mt-1">See where your bags are in the airport luggage system</p>
      </div>

      {passengerBags.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center text-gray-600">
          No bags found for your ticket.
        </div>
      ) : (
        <div className="space-y-6">
          {flight && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-sm text-gray-600">Flight</p>
              <p className="font-semibold text-gray-900 mt-1">{flight.airlineCode} {flight.flightNumber} to {flight.destination}</p>
              <p className="text-sm text-gray-600 mt-1">Gate {flight.gate}</p>
            </div>
          )}

          {passengerBags.map(bag => {
            const currentStep = stepIndex(bag.location);
            return (
              <div key={bag.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">Bag {bag.bagId}</p>
                    <p className="text-sm text-gray-600 mt-1">Current: {bag.location}{bag.locationDetail ? ` • ${bag.locationDetail}` : ''}</p>
                    {bag.securityIssue && (
                      <p className="text-sm text-red-700 mt-1">Security issue flagged. Airline staff have been notified.</p>
                    )}
                  </div>
                </div>

                <div className="mt-5">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    {steps.map((s, idx) => {
                      const done = idx < currentStep;
                      const active = idx === currentStep;
                      return (
                        <div key={s.key} className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${done ? 'bg-gray-900 border-gray-900 text-white' : active ? 'bg-white border-gray-900 text-gray-900' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                            {done ? <CheckCircle2 className="w-4 h-4" /> : s.icon}
                          </div>
                          <div>
                            <p className={`text-sm ${active ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{s.label}</p>
                            {s.key === 'gate' && bag.gate && (
                              <p className="text-xs text-gray-500">Gate {bag.gate}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
