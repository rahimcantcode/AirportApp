import React from 'react';
import { useApp } from '../../context/AppContext';
import { SectionTitle } from '../../components/ui';

export function GateDashboard() {
  const { flights, passengers } = useApp();
  const boarded = passengers.filter((p) => p.boarded).length;

  return (
    <div>
      <SectionTitle title="Gate Staff Dashboard" subtitle="Boarding status" />
      <div className="grid">
        <div className="stat">
          <div className="stat__label">Flights</div>
          <div className="stat__value">{flights.length}</div>
        </div>
        <div className="stat">
          <div className="stat__label">Passengers boarded</div>
          <div className="stat__value">{boarded}</div>
        </div>
      </div>
      <div className="note">Use Boarding to validate tickets and confirm passenger flight matches the selected gate flight.</div>
    </div>
  );
}
