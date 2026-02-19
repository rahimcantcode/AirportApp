import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Field, SectionTitle } from '../../components/ui';
import { isLuggageIdValid } from '../../utils/validation';

export function UpdateBags() {
  const { passengers, bagEvents, flights, addBagEvent, addToast } = useApp();
  const [luggageId, setLuggageId] = useState('');
  const [location, setLocation] = useState('Security');
  const [status, setStatus] = useState<'received_security' | 'cleared_security' | 'at_gate'>('received_security');

  const error = useMemo(() => {
    if (!luggageId.trim()) return 'Luggage ID is required.';
    if (!isLuggageIdValid(luggageId.trim())) return 'Luggage ID must be 6 digits.';
    return '';
  }, [luggageId]);

  const owner = passengers.find((p) => p.luggageId === luggageId.trim());
  const flight = owner ? flights.find((f) => f.id === owner.flightId) : undefined;

  const onUpdate = () => {
    if (error) {
      addToast({ type: 'error', title: 'Invalid luggage ID', message: error });
      return;
    }
    addBagEvent({ luggageId: luggageId.trim(), location: location.trim() || 'Unknown', status, gate: flight?.gate });
    addToast({ type: 'success', title: 'Bag updated' });
  };

  const history = useMemo(
    () => bagEvents.filter((e) => e.luggageId === luggageId.trim()).slice(0, 10),
    [bagEvents, luggageId]
  );

  return (
    <div>
      <SectionTitle title="Update Bags" subtitle="Record bag status and location" />

      <div className="form">
        <Field label="Luggage ID" error={error || undefined}>
          <input className="input" value={luggageId} onChange={(e) => setLuggageId(e.target.value)} placeholder="6 digits" />
        </Field>
        <Field label="Status">
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value as any)}>
            <option value="received_security">received_security</option>
            <option value="cleared_security">cleared_security</option>
            <option value="at_gate">at_gate</option>
          </select>
        </Field>
        <Field label="Location">
          <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Security" />
        </Field>
        <div className="row row--end">
          <button className="btn" type="button" onClick={onUpdate}>Add event</button>
        </div>
      </div>

      {owner ? (
        <div className="card card--soft">
          <div className="subhead">Owner and flight</div>
          <div><b>Passenger:</b> {owner.fullName}</div>
          <div><b>Ticket:</b> {owner.ticketNumber}</div>
          <div><b>Flight:</b> {flight ? flight.airlineFlightNo : 'Missing flight'}</div>
          <div><b>Gate:</b> {flight ? flight.gate : '-'}</div>
        </div>
      ) : luggageId.trim() ? (
        <div className="note">No passenger matches this luggage ID yet.</div>
      ) : null}

      {history.length > 0 ? (
        <div className="card card--soft">
          <div className="subhead">Recent events</div>
          <div className="list">
            {history.map((e) => (
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
    </div>
  );
}
