import React from 'react';
import { useApp } from '../../context/AppContext';
import { SectionTitle } from '../../components/ui';

export function AirlineDashboard() {
  const { passengers } = useApp();
  const checked = passengers.filter((p) => p.checkedIn).length;

  return (
    <div>
      <SectionTitle title="Airline Staff Dashboard" subtitle="Quick view" />
      <div className="grid">
        <div className="stat">
          <div className="stat__label">Total passengers</div>
          <div className="stat__value">{passengers.length}</div>
        </div>
        <div className="stat">
          <div className="stat__label">Checked in</div>
          <div className="stat__value">{checked}</div>
        </div>
      </div>
      <div className="note">Use Check In to validate ticket numbers and mark passengers checked in.</div>
    </div>
  );
}
