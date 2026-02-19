import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Field, SectionTitle } from '../../components/ui';

export function FlightDeparture() {
  const { flights, passengers, addToast } = useApp();
  const [flightId, setFlightId] = useState('');

  const selected = useMemo(() => flights.find((f) => f.id === flightId), [flightId, flights]);
  const pax = useMemo(() => passengers.filter((p) => p.flightId === flightId), [passengers, flightId]);

  const onAnnounce = () => {
    if (!flightId) {
      addToast({ type: 'error', title: 'Select a flight' });
      return;
    }
    addToast({ type: 'info', title: 'Departure status', message: 'This demo page can be extended to lock boarding and record departure time.' });
  };

  return (
    <div>
      <SectionTitle title="Flight Departure" subtitle="Select a flight and review boarding status" />

      <div className="form">
        <Field label="Flight">
          <select className="input" value={flightId} onChange={(e) => setFlightId(e.target.value)}>
            <option value="">Select flight</option>
            {flights.map((f) => (
              <option key={f.id} value={f.id}>
                {f.airlineFlightNo} Gate {f.gate}
              </option>
            ))}
          </select>
        </Field>

        <div className="row row--end">
          <button className="btn" type="button" onClick={onAnnounce}>Review</button>
        </div>
      </div>

      {selected ? (
        <div className="card card--soft">
          <div><b>Flight:</b> {selected.airlineFlightNo}</div>
          <div><b>Route:</b> {selected.origin} → {selected.destination}</div>
          <div><b>Gate:</b> {selected.gate}</div>
          <div><b>Departure:</b> {new Date(selected.departureTime).toLocaleString()}</div>
          <div><b>Passengers boarded:</b> {pax.filter((p) => p.boarded).length} / {pax.length}</div>
        </div>
      ) : null}
    </div>
  );
}
