import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Divider, Field, SectionTitle } from '../../components/ui';
import { isAirlineFlightNoValid } from '../../utils/validation';

export function ManageFlights() {
  const { flights, addFlight, removeFlight, addToast } = useApp();

  const [airlineFlightNo, setAirlineFlightNo] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [gate, setGate] = useState('');

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!airlineFlightNo.trim()) e.airlineFlightNo = 'Flight number is required.';
    if (airlineFlightNo.trim() && !isAirlineFlightNoValid(airlineFlightNo.trim())) e.airlineFlightNo = 'Format: 2 letters + 4 digits (example: AA1234).';
    if (!origin.trim()) e.origin = 'Origin is required.';
    if (!destination.trim()) e.destination = 'Destination is required.';
    if (!departureTime.trim()) e.departureTime = 'Departure time is required.';
    if (!gate.trim()) e.gate = 'Gate is required.';
    return e;
  }, [airlineFlightNo, origin, destination, departureTime, gate]);

  const onAdd = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (Object.keys(errors).length > 0) {
      addToast({ type: 'error', title: 'Fix flight fields', message: 'Missing or invalid flight information.' });
      return;
    }

    const res = addFlight({
      airlineFlightNo: airlineFlightNo.trim().toUpperCase(),
      origin: origin.trim().toUpperCase(),
      destination: destination.trim().toUpperCase(),
      departureTime: new Date(departureTime).toISOString(),
      gate: gate.trim().toUpperCase(),
    });

    if (!res.ok) {
      addToast({ type: 'error', title: 'Could not add flight', message: res.error || 'Unknown error.' });
      return;
    }

    addToast({ type: 'success', title: 'Flight added' });
    setAirlineFlightNo('');
    setOrigin('');
    setDestination('');
    setDepartureTime('');
    setGate('');
  };

  return (
    <div>
      <SectionTitle title="Manage Flights" subtitle="Add and view flights" />

      <form className="form" onSubmit={onAdd}>
        <div className="grid grid--2">
          <Field label="Airline flight number" error={errors.airlineFlightNo}>
            <input className="input" value={airlineFlightNo} onChange={(e) => setAirlineFlightNo(e.target.value)} placeholder="AA1234" />
          </Field>
          <Field label="Gate" error={errors.gate}>
            <input className="input" value={gate} onChange={(e) => setGate(e.target.value)} placeholder="A12" />
          </Field>
          <Field label="Origin" error={errors.origin}>
            <input className="input" value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="DFW" />
          </Field>
          <Field label="Destination" error={errors.destination}>
            <input className="input" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="LAX" />
          </Field>
          <Field label="Departure time" error={errors.departureTime}>
            <input className="input" type="datetime-local" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} />
          </Field>
          <div className="row row--end" style={{ alignItems: 'end' }}>
            <button className="btn" type="submit">Add flight</button>
          </div>
        </div>
      </form>

      <Divider />

      <div className="table">
        <div className="table__header">
          <div>Flight</div>
          <div>Route</div>
          <div>Departure</div>
          <div>Gate</div>
          <div></div>
        </div>
        {flights.map((f) => (
          <div key={f.id} className="table__row">
            <div>{f.airlineFlightNo}</div>
            <div>{f.origin} → {f.destination}</div>
            <div>{new Date(f.departureTime).toLocaleString()}</div>
            <div>{f.gate}</div>
            <div className="row row--end">
              <button className="btn btn--danger" onClick={() => removeFlight(f.id)} type="button">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
