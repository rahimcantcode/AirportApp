import React from 'react';
import { useApp } from '../../context/AppContext';
import { SectionTitle } from '../../components/ui';

export function AdminDashboard() {
  const { users, flights, passengers, messages } = useApp();

  return (
    <div>
      <SectionTitle title="Admin Dashboard" subtitle="System overview" />

      <div className="grid">
        <div className="stat">
          <div className="stat__label">Users</div>
          <div className="stat__value">{users.length}</div>
        </div>
        <div className="stat">
          <div className="stat__label">Flights</div>
          <div className="stat__value">{flights.length}</div>
        </div>
        <div className="stat">
          <div className="stat__label">Passengers</div>
          <div className="stat__value">{passengers.length}</div>
        </div>
        <div className="stat">
          <div className="stat__label">Messages</div>
          <div className="stat__value">{messages.length}</div>
        </div>
      </div>

      <div className="note">Use the menu to manage flights, passengers, staff, and messages.</div>
    </div>
  );
}
