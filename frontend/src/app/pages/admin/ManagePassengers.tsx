import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Divider, Field, SectionTitle } from '../../components/ui';
import { isEmailValid, isLuggageIdValid, isPhoneValid, isTicketValid } from '../../utils/validation';

export function ManagePassengers() {
  const { passengers, flights, addPassenger, addToast } = useApp();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [ticketNumber, setTicketNumber] = useState('');
  const [luggageId, setLuggageId] = useState('');
  const [flightId, setFlightId] = useState('');

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = 'Name is required.';
    if (!email.trim()) e.email = 'Email is required.';
    if (email.trim() && !isEmailValid(email.trim())) e.email = 'Email format example: user@aa.com';
    if (!phone.trim()) e.phone = 'Phone is required.';
    if (phone.trim() && !isPhoneValid(phone.trim())) e.phone = 'Phone must be 10 digits.';
    if (!ticketNumber.trim()) e.ticketNumber = 'Ticket number is required.';
    if (ticketNumber.trim() && !isTicketValid(ticketNumber.trim())) e.ticketNumber = 'Ticket number must be 10 digits.';
    if (!luggageId.trim()) e.luggageId = 'Luggage ID is required.';
    if (luggageId.trim() && !isLuggageIdValid(luggageId.trim())) e.luggageId = 'Luggage ID must be 6 digits.';
    if (!flightId) e.flightId = 'Flight is required.';

    if (ticketNumber.trim() && passengers.some((p) => p.ticketNumber === ticketNumber.trim())) {
      e.ticketNumber = 'Ticket number already exists.';
    }
    if (luggageId.trim() && passengers.some((p) => p.luggageId === luggageId.trim())) {
      e.luggageId = 'Luggage ID already exists.';
    }

    return e;
  }, [fullName, email, phone, ticketNumber, luggageId, flightId, passengers]);

  const onAdd = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (Object.keys(errors).length > 0) {
      addToast({ type: 'error', title: 'Fix passenger fields', message: 'Missing or invalid passenger information.' });
      return;
    }

    const res = addPassenger({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      ticketNumber: ticketNumber.trim(),
      luggageId: luggageId.trim(),
      flightId,
    });

    if (!res.ok) {
      addToast({ type: 'error', title: 'Could not add passenger', message: res.error || 'Unknown error.' });
      return;
    }

    addToast({ type: 'success', title: 'Passenger added' });
    setFullName('');
    setEmail('');
    setPhone('');
    setTicketNumber('');
    setLuggageId('');
    setFlightId('');
  };

  return (
    <div>
      <SectionTitle title="Manage Passengers" subtitle="Add passengers and assign flights" />

      <form className="form" onSubmit={onAdd}>
        <div className="grid grid--2">
          <Field label="Full name" error={errors.fullName}>
            <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </Field>
          <Field label="Email" error={errors.email}>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@aa.com" />
          </Field>
          <Field label="Phone" error={errors.phone}>
            <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10 digits" />
          </Field>
          <Field label="Ticket number" error={errors.ticketNumber}>
            <input className="input" value={ticketNumber} onChange={(e) => setTicketNumber(e.target.value)} placeholder="10 digits" />
          </Field>
          <Field label="Luggage ID" error={errors.luggageId}>
            <input className="input" value={luggageId} onChange={(e) => setLuggageId(e.target.value)} placeholder="6 digits" />
          </Field>
          <Field label="Flight" error={errors.flightId}>
            <select className="input" value={flightId} onChange={(e) => setFlightId(e.target.value)}>
              <option value="">Select a flight</option>
              {flights.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.airlineFlightNo} ({f.origin} → {f.destination}, Gate {f.gate})
                </option>
              ))}
            </select>
          </Field>
          <div className="row row--end" style={{ alignItems: 'end' }}>
            <button className="btn" type="submit">Add passenger</button>
          </div>
        </div>
      </form>

      <Divider />

      <div className="table">
        <div className="table__header">
          <div>Name</div>
          <div>Ticket</div>
          <div>Flight</div>
          <div>Gate</div>
          <div>Status</div>
        </div>
        {passengers.map((p) => {
          const f = flights.find((x) => x.id === p.flightId);
          return (
            <div key={p.id} className="table__row">
              <div>{p.fullName}</div>
              <div>{p.ticketNumber}</div>
              <div>{f ? f.airlineFlightNo : 'Missing flight'}</div>
              <div>{f ? f.gate : '-'}</div>
              <div>
                {p.checkedIn ? 'Checked in' : 'Not checked in'}
                {' | '}
                {p.boarded ? 'Boarded' : 'Not boarded'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
