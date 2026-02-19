import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Field, SectionTitle } from '../../components/ui';
import { isLuggageIdValid } from '../../utils/validation';

export function LoadBags() {
  const { passengers, flights, addBagEvent, addToast } = useApp();
  const [flightId, setFlightId] = useState('');
  const [luggageId, setLuggageId] = useState('');

  const flight = useMemo(() => flights.find((f) => f.id === flightId), [flights, flightId]);

  const error = useMemo(() => {
    if (!flightId) return 'Select a flight.';
    if (!luggageId.trim()) return 'Luggage ID is required.';
    if (!isLuggageIdValid(luggageId.trim())) return 'Luggage ID must be 6 digits.';
    const owner = passengers.find((p) => p.luggageId === luggageId.trim());
    if (!owner) return 'No passenger matches this luggage ID.';
    if (owner.flightId !== flightId) return 'Luggage does not belong to the selected flight.';
    return '';
  }, [flightId, luggageId, passengers]);

  const onLoad = () => {
    if (error) {
      addToast({ type: 'error', title: 'Cannot load bag', message: error });
      return;
    }
    addBagEvent({ luggageId: luggageId.trim(), location: `Ramp for Gate ${flight?.gate || ''}`.trim(), status: 'loaded_plane', gate: flight?.gate });
    addToast({ type: 'success', title: 'Bag loaded' });
  };

  return (
    <div>
      <SectionTitle title="Load Bags" subtitle="Validate luggage ID and flight before loading" />

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
        <Field label="Luggage ID" hint="6 digits" error={error && error.includes('Luggage') ? error : undefined}>
          <input className="input" value={luggageId} onChange={(e) => setLuggageId(e.target.value)} placeholder="6 digits" />
        </Field>
        {error && !error.includes('Luggage') ? <div className="field__error">{error}</div> : null}
        <div className="row row--end">
          <button className="btn" type="button" onClick={onLoad}>Confirm load</button>
        </div>
      </div>

      <div className="note">This page enforces that the luggage belongs to the selected flight before it can be loaded.</div>
    </div>
  );
}
