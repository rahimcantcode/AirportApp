import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Field, SectionTitle } from '../../components/ui';
import { isTicketValid } from '../../utils/validation';

export function GateInfo() {
  const { passengers, flights, addToast } = useApp();
  const [ticket, setTicket] = useState('');

  const error = useMemo(() => {
    if (!ticket.trim()) return 'Ticket number is required.';
    if (!isTicketValid(ticket.trim())) return 'Ticket number must be 10 digits.';
    return '';
  }, [ticket]);

  const p = passengers.find((x) => x.ticketNumber === ticket.trim());
  const f = p ? flights.find((x) => x.id === p.flightId) : undefined;

  const onLookup = () => {
    if (error) {
      addToast({ type: 'error', title: 'Invalid ticket', message: error });
      return;
    }
    if (!p || !f) {
      addToast({ type: 'error', title: 'Not found', message: 'No passenger/flight found for this ticket.' });
      return;
    }
    addToast({ type: 'success', title: 'Gate info loaded' });
  };

  return (
    <div>
      <SectionTitle title="Gate Info" subtitle="Enter ticket number to see flight and gate" />

      <div className="form">
        <Field label="Ticket number" error={error || undefined}>
          <input className="input" value={ticket} onChange={(e) => setTicket(e.target.value)} placeholder="10 digits" />
        </Field>
        <div className="row row--end">
          <button className="btn" type="button" onClick={onLookup}>Lookup</button>
        </div>
      </div>

      {p && f ? (
        <div className="card card--soft">
          <div className="subhead">Flight details</div>
          <div><b>Name:</b> {p.fullName}</div>
          <div><b>Flight:</b> {f.airlineFlightNo}</div>
          <div><b>Route:</b> {f.origin} → {f.destination}</div>
          <div><b>Departure:</b> {new Date(f.departureTime).toLocaleString()}</div>
          <div><b>Gate:</b> {f.gate}</div>
          <div><b>Checked in:</b> {p.checkedIn ? 'Yes' : 'No'}</div>
          <div><b>Boarded:</b> {p.boarded ? 'Yes' : 'No'}</div>
        </div>
      ) : null}

      <div className="note">Consistency rule: gate staff boarding checks the selected gate flight against this passenger flight.</div>
    </div>
  );
}
