import { supabase } from '../lib/supabase.js';
import { ApiError } from '../utils/errors.js';
import { assertAirlineExists } from './airlinesService.js';
import { getGateIdByLabel } from './gatesService.js';
import type { FlightDTO } from '../types.js';
import { assertAirlineCode, assertFlightNumber } from '../utils/validation.js';

function parseFlightNumber(flightId: string): string {
  return (flightId || '').slice(2);
}

function toDto(row: any): FlightDTO {
  return {
    id: row.flight_id,
    airlineCode: row.airline_code,
    flightNumber: parseFlightNumber(row.flight_id),
    destination: row.destination,
    gate: `${row.gate?.terminal || 'T1'}-${row.gate?.gate_number || 'G00'}`,
    flightStatus: Boolean(row.flight_status),
    status: row.flight_status ? 'departed' : 'scheduled',
  };
}

export async function listFlights(): Promise<FlightDTO[]> {
  const { data, error } = await supabase
    .from('flight')
    .select('flight_id, airline_code, destination, flight_status, gate:gate_id(terminal, gate_number)')
    .order('flight_id');

  if (error) throw new ApiError(500, error.message);
  return (data || []).map(toDto);
}

export async function createFlight(input: Partial<FlightDTO>): Promise<FlightDTO> {
  if (!input.airlineCode || !input.flightNumber || !input.gate) {
    throw new ApiError(400, 'airlineCode, flightNumber, and gate are required');
  }

  assertAirlineCode(input.airlineCode);
  assertFlightNumber(input.flightNumber);

  const airlineCode = input.airlineCode.toUpperCase();
  await assertAirlineExists(airlineCode);
  const gateId = await getGateIdByLabel(input.gate);
  await assertGateAvailable(gateId);

  const flightNumber = input.flightNumber.trim();
  const flightId = `${airlineCode}${flightNumber}`;

  const payload = {
    flight_id: flightId,
    airline_code: airlineCode,
    destination: input.destination || 'TBD',
    gate_id: gateId,
    flight_status: input.status === 'departed' || input.flightStatus === true,
  };

  const { error } = await supabase.from('flight').insert(payload);
  if (error) throw new ApiError(500, error.message);

  const created = await getFlightById(flightId);
  if (!created) throw new ApiError(500, 'Failed to create flight');
  return created;
}

export async function updateFlight(id: string, input: Partial<FlightDTO>): Promise<FlightDTO> {
  const patch: Record<string, unknown> = {};

  if (input.airlineCode) {
    assertAirlineCode(input.airlineCode);
    const airlineCode = input.airlineCode.toUpperCase();
    await assertAirlineExists(airlineCode);
    patch.airline_code = airlineCode;
  }

  if (input.gate) {
    const gateId = await getGateIdByLabel(input.gate);
    await assertGateAvailable(gateId, id);
    patch.gate_id = gateId;
  }

  if (input.destination) patch.destination = input.destination;
  if (input.status || typeof input.flightStatus === 'boolean') {
    patch.flight_status = input.status === 'departed' || input.flightStatus === true;
  }

  const { error } = await supabase.from('flight').update(patch).eq('flight_id', id);
  if (error) throw new ApiError(500, error.message);

  const updated = await getFlightById(id);
  if (!updated) throw new ApiError(404, 'Flight not found');
  return updated;
}

async function assertGateAvailable(gateId: number, excludingFlightId?: string): Promise<void> {
  let query = supabase.from('flight').select('flight_id').eq('gate_id', gateId).limit(1);
  if (excludingFlightId) {
    query = query.neq('flight_id', excludingFlightId);
  }

  const { data, error } = await query.maybeSingle();
  if (error) throw new ApiError(500, error.message);
  if (data) throw new ApiError(409, 'Selected gate already has a flight');
}

export async function deleteFlight(id: string): Promise<void> {
  const { error } = await supabase.from('flight').delete().eq('flight_id', id);
  if (error) throw new ApiError(500, error.message);
}

export async function getFlightById(id: string): Promise<FlightDTO | null> {
  const { data, error } = await supabase
    .from('flight')
    .select('flight_id, airline_code, destination, flight_status, gate:gate_id(terminal, gate_number)')
    .eq('flight_id', id)
    .maybeSingle();

  if (error) throw new ApiError(500, error.message);
  return data ? toDto(data) : null;
}
