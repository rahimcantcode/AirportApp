import React, { useMemo } from 'react';
import { useApp } from '@/app/context/AppContext';
import { ShieldCheck, MapPin, ArrowRight } from 'lucide-react';

export function GroundDashboard() {
  const { flights, groundMode, setGroundMode, selectedGate, setSelectedGate } = useApp();

  const gates = useMemo(() => {
    return Array.from(new Set(flights.map(f => f.gate))).sort();
  }, [flights]);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Ground Staff Dashboard</h1>
        <p className="text-gray-500 mt-1">Choose where you are posted today: Security Clearance or Gate Ops</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`bg-white rounded-xl shadow-sm border p-6 ${groundMode === 'security-clearance' ? 'border-gray-900' : 'border-gray-200'}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-gray-700" />
                <h2 className="font-semibold text-gray-900">Security Clearance</h2>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Work the list of bags arriving from check-in counters. Move them to Security Check, clear them to their gate, or flag a violation.
              </p>
            </div>
            <button
              onClick={() => { setGroundMode('security-clearance'); setSelectedGate(null); window.location.hash = 'ground-bags'; }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800"
            >
              Start
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className={`bg-white rounded-xl shadow-sm border p-6 ${groundMode === 'gate-ops' ? 'border-gray-900' : 'border-gray-200'}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-700" />
                <h2 className="font-semibold text-gray-900">Gate Ops</h2>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Load bags for a specific gate only. This prevents loading a bag for Gate 23 while working at Gate 5.
              </p>

              <div className="mt-4">
                <label className="text-xs text-gray-600">Gate</label>
                <select
                  value={selectedGate || ''}
                  onChange={e => setSelectedGate(e.target.value || null)}
                  className="w-full mt-1 px-3 py-2 border rounded-xl"
                >
                  <option value="">Select gate</option>
                  {gates.map(g => (<option key={g} value={g}>{g}</option>))}
                </select>
                <p className="text-xs text-gray-500 mt-2">Gate selection will filter the bag list to only that gate.</p>
              </div>
            </div>

            <button
              onClick={() => { setGroundMode('gate-ops'); window.location.hash = 'ground-load'; }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800"
              disabled={!selectedGate}
              title={!selectedGate ? 'Select a gate to continue' : undefined}
            >
              Start
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
