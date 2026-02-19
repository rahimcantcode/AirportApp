import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Field, SectionTitle } from '../../components/ui';
import { isTicketValid } from '../../utils/validation';

export function CheckInPassenger() {
  const { passengers, flights, updatePassenger, addToast, addBagEvent } = useApp();
  const [ticket, setTicket] = useState('');

  const error = useMemo(() => {
    if (!ticket.trim()) return 'Ticket number is required.';
    if (!isTicketValid(ticket.trim())) return 'Ticket number must be 10 digits.';
    return '';
  }, [ticket]);

  const found = passengers.find((p) => p.ticketNumber === ticket.trim());
  const flight = found ? flights.find((f) => f.id === found.flightId) : undefined;

  const onCheckIn = () => {
    if (error) {
      addToast({ type: 'error', title: 'Invalid ticket', message: error });
      return;
    }
    if (!found) {
      addToast({ type: 'error', title: 'Passenger not found', message: 'No passenger matches that ticket number.' });
      return;
    }

    updatePassenger(found.id, { checkedIn: true });
    addBagEvent({ luggageId: found.luggageId, location: 'Check-in counter', status: 'received_security' });
    addToast({ type: 'success', title: 'Checked in', message: `${found.fullName} is checked in.` });
  };

  return (
    <div>
      <SectionTitle title="Check In Passenger" subtitle="Validate ticket number and check in" />

      <div className="form">
        <Field label="Ticket number" error={error || undefined}>
          <input className="input" value={ticket} onChange={(e) => setTicket(e.target.value)} placeholder="10 digits" />
        </Field>
        <div className="row row--end">
          <button className="btn" type="button" onClick={onCheckIn}>Check in</button>
        </div>
      </div>

      {found ? (
        <div className="card card--soft">
          <div className="subhead">Passenger details</div>
          <div><b>Name:</b> {found.fullName}</div>
          <div><b>Email:</b> {found.email}</div>
          <div><b>Phone:</b> {found.phone}</div>
          <div><b>Luggage ID:</b> {found.luggageId}</div>
          <div><b>Flight:</b> {flight ? `${flight.airlineFlightNo} (${flight.origin} → ${flight.destination})` : 'Missing flight'}</div>
          <div><b>Gate:</b> {flight ? flight.gate : '-'}</div>
          <div><b>Status:</b> {found.checkedIn ? 'Checked in' : 'Not checked in'}</div>
        </div>
      ) : null}
    </div>
  );
}
