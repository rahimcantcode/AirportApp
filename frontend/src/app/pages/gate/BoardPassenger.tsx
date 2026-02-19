import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Field, SectionTitle } from '../../components/ui';
import { isTicketValid } from '../../utils/validation';

export function BoardPassenger() {
  const { passengers, flights, updatePassenger, addToast, addBagEvent } = useApp();
  const [ticket, setTicket] = useState('');
  const [flightId, setFlightId] = useState('');

  const ticketError = useMemo(() => {
    if (!ticket.trim()) return 'Ticket number is required.';
    if (!isTicketValid(ticket.trim())) return 'Ticket number must be 10 digits.';
    return '';
  }, [ticket]);

  const flightError = useMemo(() => {
    if (!flightId) return 'Select the gate flight.';
    return '';
  }, [flightId]);

  const found = passengers.find((p) => p.ticketNumber === ticket.trim());
  const passengerFlight = found ? flights.find((f) => f.id === found.flightId) : undefined;
  const selectedFlight = flightId ? flights.find((f) => f.id === flightId) : undefined;

  const onBoard = () => {
    if (ticketError || flightError) {
      addToast({ type: 'error', title: 'Fix boarding fields', message: ticketError || flightError });
      return;
    }
    if (!found) {
      addToast({ type: 'error', title: 'Passenger not found', message: 'No passenger matches that ticket number.' });
      return;
    }
    if (!found.checkedIn) {
      addToast({ type: 'error', title: 'Not checked in', message: 'Passenger must be checked in before boarding.' });
      return;
    }
    if (found.flightId !== flightId) {
      // Consistency check: passenger flight info must match the gate flight
      addToast({
        type: 'error',
        title: 'Flight mismatch',
        message: 'Passenger flight information does not match the selected gate flight.',
      });
      return;
    }

    updatePassenger(found.id, { boarded: true });
    if (selectedFlight) {
      addBagEvent({ luggageId: found.luggageId, location: `Gate ${selectedFlight.gate}`, status: 'at_gate', gate: selectedFlight.gate });
    }
    addToast({ type: 'success', title: 'Boarded', message: `${found.fullName} has boarded.` });
  };

  return (
    <div>
      <SectionTitle title="Board Passenger" subtitle="Validate ticket and verify flight consistency" />

      <div className="form">
        <Field label="Gate flight" error={flightError || undefined}>
          <select className="input" value={flightId} onChange={(e) => setFlightId(e.target.value)}>
            <option value="">Select flight at this gate</option>
            {flights.map((f) => (
              <option key={f.id} value={f.id}>
                {f.airlineFlightNo} ({f.origin} → {f.destination}) Gate {f.gate}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Ticket number" error={ticketError || undefined}>
          <input className="input" value={ticket} onChange={(e) => setTicket(e.target.value)} placeholder="10 digits" />
        </Field>

        <div className="row row--end">
          <button className="btn" type="button" onClick={onBoard}>Confirm boarding</button>
        </div>
      </div>

      {found ? (
        <div className="card card--soft">
          <div className="subhead">Passenger details</div>
          <div><b>Name:</b> {found.fullName}</div>
          <div><b>Ticket:</b> {found.ticketNumber}</div>
          <div><b>Checked in:</b> {found.checkedIn ? 'Yes' : 'No'}</div>
          <div><b>Boarded:</b> {found.boarded ? 'Yes' : 'No'}</div>
          <div><b>Passenger flight:</b> {passengerFlight ? passengerFlight.airlineFlightNo : 'Missing flight'}</div>
          <div><b>Passenger gate:</b> {passengerFlight ? passengerFlight.gate : '-'}</div>
          <div><b>Selected gate flight:</b> {selectedFlight ? selectedFlight.airlineFlightNo : '-'}</div>
        </div>
      ) : null}

      <div className="note">Consistency rule: the passenger flight must match the gate flight before boarding is allowed.</div>
    </div>
  );
}
