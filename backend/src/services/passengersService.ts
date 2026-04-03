import { supabase } from '../lib/supabase.js';
import { ApiError } from '../utils/errors.js';
import type { PassengerDTO } from '../types.js';
import { assertFlightId, assertIdentification, assertPassengerStatus, assertTicketNumber } from '../utils/validation.js';

function toDto(row: any): PassengerDTO {
  return {
    id: row.ticket_number,
    name: `${row.first_name} ${row.last_name}`.trim(),
    ticketNumber: row.ticket_number,
    identificationNumber: row.identification,
    flightId: row.flight_id,
    status: row.status,
    boarded: Number(row.boarded || 0),
  };
}

function splitName(name?: string): { first_name: string; last_name: string } {
  const value = (name || '').trim();
  if (!value) return { first_name: 'Unknown', last_name: 'Passenger' };
  const [first, ...rest] = value.split(/\s+/);
  return { first_name: first, last_name: rest.join(' ') || 'Passenger' };
}

export async function listPassengers(): Promise<PassengerDTO[]> {
  const { data, error } = await supabase
    .from('passenger')
    .select('ticket_number, first_name, last_name, identification, flight_id, status, boarded')
    .order('last_name');

  if (error) throw new ApiError(500, error.message);
  return (data || []).map(toDto);
}

export async function listPassengersByFlightId(flightId: string): Promise<PassengerDTO[]> {
  const { data, error } = await supabase
    .from('passenger')
    .select('ticket_number, first_name, last_name, identification, flight_id, status, boarded')
    .eq('flight_id', flightId)
    .order('last_name');

  if (error) throw new ApiError(500, error.message);
  return (data || []).map(toDto);
}

export async function createPassenger(input: Partial<PassengerDTO>): Promise<PassengerDTO> {
  if (!input.ticketNumber || !input.identificationNumber || !input.flightId) {
    throw new ApiError(400, 'ticketNumber, identificationNumber, and flightId are required');
  }

  assertTicketNumber(input.ticketNumber);
  assertIdentification(input.identificationNumber);
  assertFlightId(input.flightId);

  const names = splitName(input.name);
  const status = input.status || 'not-checked-in';
  assertPassengerStatus(status);
  const boarded = typeof input.boarded === 'number' ? input.boarded : status === 'boarded' ? 1 : 0;
  await assertFlightExists(input.flightId);

  const payload = {
    ticket_number: input.ticketNumber,
    identification: input.identificationNumber,
    flight_id: input.flightId,
    status,
    boarded,
    ...names,
  };

  const { error } = await supabase.from('passenger').insert(payload);
  if (error) throw new ApiError(500, error.message);

  const created = await getPassengerByTicket(input.ticketNumber);
  if (!created) throw new ApiError(500, 'Failed to create passenger');
  return created;
}

export async function updatePassenger(ticketNumber: string, input: Partial<PassengerDTO>): Promise<PassengerDTO> {
  assertTicketNumber(ticketNumber);
  const patch: Record<string, unknown> = {};

  if (input.name) {
    const split = splitName(input.name);
    patch.first_name = split.first_name;
    patch.last_name = split.last_name;
  }
  if (input.identificationNumber) {
    assertIdentification(input.identificationNumber);
    patch.identification = input.identificationNumber;
  }
  if (input.flightId) {
    assertFlightId(input.flightId);
    await assertFlightExists(input.flightId);
    patch.flight_id = input.flightId;
  }
  if (input.status) {
    assertPassengerStatus(input.status);
    patch.status = input.status;
  }
  if (typeof input.boarded === 'number') {
    patch.boarded = input.boarded;
  } else if (input.status) {
    patch.boarded = input.status === 'boarded' ? 1 : 0;
  }

  if (input.status === 'boarded') {
    await assertCanBoardPassenger(ticketNumber);
  }

  const { error } = await supabase.from('passenger').update(patch).eq('ticket_number', ticketNumber);
  if (error) throw new ApiError(500, error.message);

  const updated = await getPassengerByTicket(ticketNumber);
  if (!updated) throw new ApiError(404, 'Passenger not found');
  return updated;
}

export async function deletePassenger(ticketNumber: string): Promise<void> {
  assertTicketNumber(ticketNumber);
  const { error } = await supabase.from('passenger').delete().eq('ticket_number', ticketNumber);
  if (error) throw new ApiError(500, error.message);
}

export async function deletePassengerById(passengerId: string): Promise<void> {
  const id = passengerId.trim();
  if (!id) throw new ApiError(400, 'passengerId is required');
  const { error } = await supabase.from('passenger').delete().eq('ticket_number', id);
  if (error) throw new ApiError(500, error.message);
}

export async function getPassengerByTicket(ticketNumber: string): Promise<PassengerDTO | null> {
  assertTicketNumber(ticketNumber);
  const { data, error } = await supabase
    .from('passenger')
    .select('ticket_number, first_name, last_name, identification, flight_id, status, boarded')
    .eq('ticket_number', ticketNumber)
    .maybeSingle();

  if (error) throw new ApiError(500, error.message);
  return data ? toDto(data) : null;
}

async function assertFlightExists(flightId: string): Promise<void> {
  const { data, error } = await supabase.from('flight').select('flight_id').eq('flight_id', flightId).maybeSingle();
  if (error) throw new ApiError(500, error.message);
  if (!data) throw new ApiError(400, `flightId ${flightId} does not exist`);
}

async function assertCanBoardPassenger(ticketNumber: string): Promise<void> {
  const { data: passenger, error: passengerErr } = await supabase
    .from('passenger')
    .select('ticket_number, status')
    .eq('ticket_number', ticketNumber)
    .single();

  if (passengerErr) throw new ApiError(500, passengerErr.message);
  if (passenger.status !== 'checked-in') {
    throw new ApiError(409, 'Passenger must be checked-in before boarding');
  }

  const { data: bags, error: bagsErr } = await supabase.from('bag').select('bag_id, status').eq('ticket_number', ticketNumber);
  if (bagsErr) throw new ApiError(500, bagsErr.message);

  const notAtGate = (bags || []).find((bag) => bag.status !== 'gate');
  if (notAtGate) {
    throw new ApiError(409, 'All passenger bags must be at gate before boarding');
  }
}
