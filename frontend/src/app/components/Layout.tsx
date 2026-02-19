import React from 'react';
import { useApp } from '../context/AppContext';

type NavItem = { hash: string; label: string; roles: Array<string> };

const NAV: NavItem[] = [
  // Admin
  { hash: 'admin-dashboard', label: 'Dashboard', roles: ['admin'] },
  { hash: 'admin-flights', label: 'Flights', roles: ['admin'] },
  { hash: 'admin-passengers', label: 'Passengers', roles: ['admin'] },
  { hash: 'admin-staff', label: 'Staff', roles: ['admin'] },
  { hash: 'admin-messages', label: 'Messages', roles: ['admin'] },

  // Airline
  { hash: 'airline-dashboard', label: 'Dashboard', roles: ['airline'] },
  { hash: 'airline-checkin', label: 'Check In', roles: ['airline'] },
  { hash: 'airline-messages', label: 'Messages', roles: ['airline'] },

  // Gate
  { hash: 'gate-dashboard', label: 'Dashboard', roles: ['gate'] },
  { hash: 'gate-boarding', label: 'Boarding', roles: ['gate'] },
  { hash: 'gate-departure', label: 'Departure', roles: ['gate'] },
  { hash: 'gate-messages', label: 'Messages', roles: ['gate'] },

  // Ground
  { hash: 'ground-dashboard', label: 'Dashboard', roles: ['ground'] },
  { hash: 'ground-bags', label: 'Update Bags', roles: ['ground'] },
  { hash: 'ground-load', label: 'Load Bags', roles: ['ground'] },
  { hash: 'ground-messages', label: 'Messages', roles: ['ground'] },

  // Passenger
  { hash: 'passenger-track', label: 'Track Bags', roles: ['passenger'] },
  { hash: 'passenger-gate', label: 'Gate Info', roles: ['passenger'] },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { currentUser } = useApp();

  const role = currentUser?.role;
  const items = NAV.filter((n) => (role ? n.roles.includes(role) : false));

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar__title">Menu</div>
        <nav className="sidebar__nav">
          {items.map((it) => (
            <a key={it.hash} className="sidebar__link" href={`#${it.hash}`}>
              {it.label}
            </a>
          ))}
        </nav>
      </aside>

      <main className="content">
        <div className="card">
          {children}
        </div>
      </main>
    </div>
  );
}
