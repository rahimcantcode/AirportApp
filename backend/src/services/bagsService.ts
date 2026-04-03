import { supabase } from '../lib/supabase.js';
import { ApiError } from '../utils/errors.js';
import type { BagDTO } from '../types.js';
import { assertBagId, assertBagLocation, assertFlightId, assertTicketNumber } from '../utils/validation.js';

function toLocationDetail(row: any): string | undefined {
  if (row.status === 'check-in-counter' && row.terminal && row.counter_number) {
    return `${row.terminal}-${row.counter_number}`;
  }
  if ((row.status === 'gate' || row.status === 'loaded') && row.terminal && row.gate_number) {
    return `${row.terminal}-${row.gate_number}`;
  }
  if (row.status === 'security-check') {
    return 'Security Check';
  }
  return undefined;
}

function toDto(row: any): BagDTO {
  return {
    id: row.bag_id,
    bagId: row.bag_id,
    ticketNumber: row.ticket_number,
    passengerId: row.ticket_number,
    flightId: row.flight_id,
    gate: row.terminal && row.gate_number ? `${row.terminal}-${row.gate_number}` : '',
    location: row.status,
    locationDetail: toLocationDetail(row),
    securityIssue: Boolean(row.bag_meta?.security_issue),
    bagHistory: row.bag_history,
  };
}

function parseLocationDetail(value?: string): { terminal?: string; counter_number?: string; gate_number?: string } {
  const raw = (value || '').trim().toUpperCase();
  if (!raw) return {};
  const [terminal, spot] = raw.includes('-') ? raw.split('-', 2) : ['T1', raw];
  if (spot.startsWith('C')) return { terminal, counter_number: spot };
  return { terminal, gate_number: spot };
}

function appendHistory(existing: string | null | undefined, event: string): string {
  try {
    const parsed = existing ? JSON.parse(existing) : [];
    const next = Array.isArray(parsed) ? parsed : [];
    next.push({ event, at: new Date().toISOString() });
    return JSON.stringify(next);
  } catch {
    return JSON.stringify([{ event, at: new Date().toISOString() }]);
  }
}

async function ensureGroundAccessForBag(bagId: string): Promise<void> {
  const { data: staff, error: staffErr } = await supabase.from('ground_staff').select('ground_staff_id');
  if (staffErr) throw new ApiError(500, staffErr.message);
  if (!staff?.length) return;

  const rows = staff.map((s) => ({ ground_staff_id: s.ground_staff_id, bag_id: bagId }));
  const { error } = await supabase.from('ground_staff_bag_access').upsert(rows, { onConflict: 'ground_staff_id,bag_id' });
  if (error) throw new ApiError(500, error.message);
}

export async function listBags(filters?: { gate?: string; flightId?: string }): Promise<BagDTO[]> {
  let query = supabase
    .from('bag')
    .select('bag_id, ticket_number, flight_id, terminal, counter_number, gate_number, status, bag_history, bag_meta:bag_meta(security_issue)')
    .order('bag_id');

  if (filters?.flightId) {
    query = query.eq('flight_id', filters.flightId);
  }
  if (filters?.gate) {
    const raw = filters.gate.trim().toUpperCase();
    const gateNumber = raw.includes('-') ? raw.split('-', 2)[1] : raw;
    query = query.eq('gate_number', gateNumber);
  }

  const { data, error } = await query;

  if (error) throw new ApiError(500, error.message);
  return (data || []).map(toDto);
}

export async function createBag(input: Partial<BagDTO>): Promise<BagDTO> {
  if (!input.bagId || !input.ticketNumber || !input.flightId) {
    throw new ApiError(400, 'bagId, ticketNumber, and flightId are required');
  }

  assertBagId(input.bagId);
  assertTicketNumber(input.ticketNumber);
  assertFlightId(input.flightId);

  const parsedDetail = parseLocationDetail(input.locationDetail || input.gate);
  const status = input.location || 'check-in-counter';
  assertBagLocation(status);
  const history = appendHistory('[]', `Bag created at ${status}`);
  await assertPassengerTicketExists(input.ticketNumber);

  const payload = {
    bag_id: input.bagId,
    ticket_number: input.ticketNumber,
    flight_id: input.flightId,
    status,
    location_type: status,
    bag_history: history,
    ...parsedDetail,
  };

  const { error } = await supabase.from('bag').insert(payload);
  if (error) throw new ApiError(500, error.message);

  const { error: metaErr } = await supabase
    .from('bag_meta')
    .upsert({ bag_id: input.bagId, security_issue: Boolean(input.securityIssue) }, { onConflict: 'bag_id' });
  if (metaErr) throw new ApiError(500, metaErr.message);

  await ensureGroundAccessForBag(input.bagId);

  const created = await getBagById(input.bagId);
  if (!created) throw new ApiError(500, 'Failed to create bag');
  return created;
}

export async function updateBag(bagId: string, input: Partial<BagDTO>): Promise<BagDTO> {
  assertBagId(bagId);
  const current = await getBagById(bagId);
  if (!current) throw new ApiError(404, 'Bag not found');

  const patch: Record<string, unknown> = {};
  if (input.ticketNumber) {
    assertTicketNumber(input.ticketNumber);
    await assertPassengerTicketExists(input.ticketNumber);
    patch.ticket_number = input.ticketNumber;
  }
  if (input.flightId) {
    assertFlightId(input.flightId);
    patch.flight_id = input.flightId;
  }

  const nextStatus = input.location || current.location;
  assertBagLocation(nextStatus);
  if (nextStatus === 'loaded') {
    await assertPassengerBoarded(current.ticketNumber);
  }
  patch.status = nextStatus;
  patch.location_type = nextStatus;

  if (input.locationDetail || input.gate) {
    const parsedDetail = parseLocationDetail(input.locationDetail || input.gate);
    Object.assign(patch, parsedDetail);
  }

  patch.bag_history = appendHistory(current.bagHistory, `Status set to ${nextStatus}`);

  const { error } = await supabase.from('bag').update(patch).eq('bag_id', bagId);
  if (error) throw new ApiError(500, error.message);

  if (typeof input.securityIssue === 'boolean') {
    const { error: metaErr } = await supabase
      .from('bag_meta')
      .upsert({ bag_id: bagId, security_issue: input.securityIssue }, { onConflict: 'bag_id' });
    if (metaErr) throw new ApiError(500, metaErr.message);
  }

  const updated = await getBagById(bagId);
  if (!updated) throw new ApiError(404, 'Bag not found');
  return updated;
}

export async function deleteBag(bagId: string): Promise<void> {
  assertBagId(bagId);
  const { error } = await supabase.from('bag').delete().eq('bag_id', bagId);
  if (error) throw new ApiError(500, error.message);
}

export async function getBagById(bagId: string): Promise<BagDTO | null> {
  assertBagId(bagId);
  const { data, error } = await supabase
    .from('bag')
    .select('bag_id, ticket_number, flight_id, terminal, counter_number, gate_number, status, bag_history, bag_meta:bag_meta(security_issue)')
    .eq('bag_id', bagId)
    .maybeSingle();

  if (error) throw new ApiError(500, error.message);
  return data ? toDto(data) : null;
}

async function assertPassengerTicketExists(ticketNumber: string): Promise<void> {
  const { data, error } = await supabase
    .from('passenger')
    .select('ticket_number')
    .eq('ticket_number', ticketNumber)
    .maybeSingle();
  if (error) throw new ApiError(500, error.message);
  if (!data) throw new ApiError(400, `ticketNumber ${ticketNumber} does not exist`);
}

async function assertPassengerBoarded(ticketNumber: string): Promise<void> {
  const { data, error } = await supabase
    .from('passenger')
    .select('status')
    .eq('ticket_number', ticketNumber)
    .maybeSingle();
  if (error) throw new ApiError(500, error.message);
  if (!data) throw new ApiError(400, 'Passenger not found for bag');
  if (data.status !== 'boarded') {
    throw new ApiError(409, 'Cannot load bag: passenger is not boarded');
  }
}
