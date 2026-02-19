import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Button, DashboardCard, PageHeader } from '../../components/ui';

export function AdminDashboard() {
  const { users, flights, passengers, bagEvents, addToast } = useApp();

  const readiness = useMemo(() => {
    return flights
      .map((f) => {
        const pax = passengers.filter((p) => p.flightId === f.id);
        const boarded = pax.filter((p) => p.boarded).length;
        const loaded = pax.filter((p) => bagEvents.some((b) => b.luggageId === p.luggageId && b.status === 'loaded_plane')).length;
        return {
          flight: f,
          boarded,
          total: pax.length,
          loaded,
          ready: pax.length > 0 && boarded === pax.length && loaded === pax.length,
        };
      })
      .sort((a, b) => +new Date(a.flight.departureTime) - +new Date(b.flight.departureTime));
  }, [flights, passengers, bagEvents]);

  const readyCount = readiness.filter((r) => r.ready).length;
  const staffCount = users.filter((u) => u.role !== 'passenger').length;

  return (
    <div className="page-stack">
      <PageHeader title="Admin Console" subtitle="Operations overview and quick actions" />

      <div className="grid dashboard-stats">
        <div className="stat"><div className="stat__label">Active flights</div><div className="stat__value">{flights.length}</div></div>
        <div className="stat"><div className="stat__label">Ready notifications</div><div className="stat__value">{readyCount}</div></div>
        <div className="stat"><div className="stat__label">Active passengers</div><div className="stat__value">{passengers.length}</div></div>
        <div className="stat"><div className="stat__label">Staff accounts</div><div className="stat__value">{staffCount}</div></div>
      </div>

      <DashboardCard
        title="Quick links"
        subtitle="Jump to common admin tasks"
        footer={
          <div className="row">
            <a href="#admin-passengers"><Button variant="secondary" type="button">Manage Passengers</Button></a>
            <a href="#admin-staff"><Button variant="secondary" type="button">Manage Staff</Button></a>
          </div>
        }
      >
        <div className="muted">Use these shortcuts to navigate without changing existing routes.</div>
      </DashboardCard>

      <div className="admin-two-col">
        <DashboardCard title="Flights" subtitle="Scheduled departures">
          <div className="table">
            <div className="table__header table__header--flights">
              <div>Flight</div><div>Route</div><div>Departure</div><div>Gate</div><div>Actions</div>
            </div>
            {flights.map((f) => (
              <div key={f.id} className="table__row table__row--flights">
                <div>{f.airlineFlightNo}</div>
                <div>{f.origin} → {f.destination}</div>
                <div>{new Date(f.departureTime).toLocaleString()}</div>
                <div>{f.gate}</div>
                <div className="row row--end action-group">
                  <a href="#admin-flights"><Button variant="secondary" type="button">Details</Button></a>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard
          title="Flight Readiness Notifications"
          subtitle="Boarding and bag loading status"
          footer={<Button type="button" onClick={() => addToast({ type: 'info', title: 'Departure authorized', message: 'This uses the same notification flow.' })}>Authorize departure</Button>}
        >
          <div className="list">
            {readiness.length === 0 ? <div className="note">No flights available.</div> : readiness.map((item) => (
              <div key={item.flight.id} className="list__item">
                <div><b>{item.flight.airlineFlightNo}</b> • Gate {item.flight.gate}</div>
                <div className="muted">Boarded: {item.boarded}/{item.total}</div>
                <div className="muted">Loaded: {item.loaded}/{item.total}</div>
                <div className="muted">Departure: {new Date(item.flight.departureTime).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
