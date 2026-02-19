import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button, DashboardCard, Field, PageHeader } from '../../components/ui';
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
    <div className="page-stack">
      <PageHeader title="Manage Flights" subtitle="Add flights and manage departure details" />

      <DashboardCard title="Flights" subtitle="Active schedule">
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
                <Button variant="secondary" type="button" onClick={() => addToast({ type: 'info', title: 'Flight details', message: `${f.airlineFlightNo} ${f.origin}→${f.destination}` })}>Details</Button>
                <Button variant="danger" onClick={() => removeFlight(f.id)} type="button">Remove</Button>
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>

      <DashboardCard title="Create Flight" subtitle="Enter route and departure details">
        <form className="form" onSubmit={onAdd}>
          <div className="grid grid--2 grouped-fields">
            <Field label="Airline code + Flight number" error={errors.airlineFlightNo}>
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
          </div>
          <div className="row row--end"><Button type="submit">Add flight</Button></div>
        </form>
      </DashboardCard>
    </div>
  );
}
