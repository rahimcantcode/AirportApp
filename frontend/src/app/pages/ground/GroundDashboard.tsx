import React from 'react';
import { useApp } from '../../context/AppContext';
import { SectionTitle } from '../../components/ui';

export function GroundDashboard() {
  const { bagEvents } = useApp();

  return (
    <div>
      <SectionTitle title="Ground Staff Dashboard" subtitle="Bag events" />
      <div className="grid">
        <div className="stat">
          <div className="stat__label">Total bag events</div>
          <div className="stat__value">{bagEvents.length}</div>
        </div>
      </div>
      <div className="note">Use Update Bags and Load Bags to record bag locations and statuses.</div>
    </div>
  );
}
