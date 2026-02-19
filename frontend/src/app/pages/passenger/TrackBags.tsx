import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Field, SectionTitle } from '../../components/ui';
import { isLuggageIdValid } from '../../utils/validation';

export function TrackBags() {
  const { bagEvents, passengers, flights, addToast } = useApp();
  const [luggageId, setLuggageId] = useState('');

  const error = useMemo(() => {
    if (!luggageId.trim()) return 'Luggage ID is required.';
    if (!isLuggageIdValid(luggageId.trim())) return 'Luggage ID must be 6 digits.';
    return '';
  }, [luggageId]);

  const owner = passengers.find((p) => p.luggageId === luggageId.trim());
  const flight = owner ? flights.find((f) => f.id === owner.flightId) : undefined;

  const events = useMemo(() => {
    const list = bagEvents.filter((e) => e.luggageId === luggageId.trim());
    return [...list].sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
  }, [bagEvents, luggageId]);

  const onSearch = () => {
    if (error) {
      addToast({ type: 'error', title: 'Invalid luggage ID', message: error });
      return;
    }
    if (events.length === 0) {
      addToast({ type: 'info', title: 'No events', message: 'No tracking events found for this luggage ID.' });
    }
  };

  return (
    <div>
      <SectionTitle title="Track Bags" subtitle="Enter luggage ID to view tracking events" />

      <div className="form">
        <Field label="Luggage ID" error={error || undefined}>
          <input className="input" value={luggageId} onChange={(e) => setLuggageId(e.target.value)} placeholder="6 digits" />
        </Field>
        <div className="row row--end">
          <button className="btn" type="button" onClick={onSearch}>Search</button>
        </div>
      </div>

      {owner ? (
        <div className="card card--soft">
          <div className="subhead">Passenger and flight</div>
          <div><b>Passenger:</b> {owner.fullName}</div>
          <div><b>Ticket:</b> {owner.ticketNumber}</div>
          <div><b>Flight:</b> {flight ? flight.airlineFlightNo : 'Missing flight'}</div>
          <div><b>Gate:</b> {flight ? flight.gate : '-'}</div>
        </div>
      ) : null}

      {events.length > 0 ? (
        <div className="card card--soft">
          <div className="subhead">Tracking events</div>
          <div className="list">
            {events.map((e) => (
              <div key={e.id} className="list__item">
                <div className="list__meta">
                  <div><b>{e.status}</b> at {e.location}</div>
                  <div className="muted">{new Date(e.timestamp).toLocaleString()}</div>
                </div>
                {e.gate ? <div className="muted">Gate: {e.gate}</div> : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="note">Rule enforced: luggage ID must be exactly 6 digits.</div>
    </div>
  );
}
