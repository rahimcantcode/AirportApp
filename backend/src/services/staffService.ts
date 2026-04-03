import { supabase } from '../lib/supabase.js';
import { ApiError } from '../utils/errors.js';
import { randomDigits } from '../utils/ids.js';
import type { StaffDTO } from '../types.js';
import { hash } from 'bcryptjs';
import { assertStrongPassword, USERNAME_RE } from '../utils/validation.js';

function pickPassword(): string {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const nums = '0123456789';
  const pick = (s: string) => s[Math.floor(Math.random() * s.length)];
  return `${pick(upper)}${pick(lower)}${pick(nums)}${pick(lower)}${pick(lower)}${pick(nums)}`;
}

function makeUsername(firstName: string, lastName: string): string {
  return ((firstName[0] || 'u') + (lastName[0] || 's')).toLowerCase() + randomDigits(2);
}

export async function listStaff(): Promise<StaffDTO[]> {
  const [airlineRes, gateRes, groundRes] = await Promise.all([
    supabase.from('airline_staff').select('airline_staff_id, first_name, last_name, email, phone, airline_code, username'),
    supabase.from('gate_staff').select('gate_staff_id, first_name, last_name, email, phone, airline_code, username'),
    supabase.from('ground_staff').select('ground_staff_id, first_name, last_name, email, phone, username'),
  ]);

  if (airlineRes.error) throw new ApiError(500, airlineRes.error.message);
  if (gateRes.error) throw new ApiError(500, gateRes.error.message);
  if (groundRes.error) throw new ApiError(500, groundRes.error.message);

  const airline = (airlineRes.data || []).map((s) => ({
    id: String(s.airline_staff_id),
    firstName: s.first_name,
    lastName: s.last_name,
    email: s.email,
    phone: s.phone,
    username: s.username,
    role: 'airline-staff' as const,
    airline: s.airline_code,
  }));

  const gate = (gateRes.data || []).map((s) => ({
    id: String(s.gate_staff_id),
    firstName: s.first_name,
    lastName: s.last_name,
    email: s.email,
    phone: s.phone,
    username: s.username,
    role: 'gate-staff' as const,
    airline: s.airline_code,
  }));

  const ground = (groundRes.data || []).map((s) => ({
    id: String(s.ground_staff_id),
    firstName: s.first_name,
    lastName: s.last_name,
    email: s.email,
    phone: s.phone,
    username: s.username,
    role: 'ground-staff' as const,
  }));

  return [...airline, ...gate, ...ground];
}

export async function createStaff(
  input: Omit<StaffDTO, 'id' | 'username' | 'password'>
): Promise<{ staff: StaffDTO; credentials: { username: string; password: string } }> {
  const username = makeUsername(input.firstName, input.lastName);
  const password = pickPassword();
  assertStrongPassword(password);
  if (!USERNAME_RE.test(username)) throw new ApiError(500, 'Generated username does not meet policy');
  const passwordHash = await hash(password, 10);

  if (input.role === 'airline-staff') {
    const { data, error } = await supabase
      .from('airline_staff')
      .insert({
        first_name: input.firstName,
        last_name: input.lastName,
        email: input.email,
        phone: input.phone,
        airline_code: input.airline,
        username,
      })
      .select('airline_staff_id')
      .single();

    if (error || !data) throw new ApiError(500, error?.message || 'Failed to create airline staff');

    const { error: credsError } = await supabase.from('staff_credentials').insert({
      username,
      password_hash: passwordHash,
      staff_role: 'airline-staff',
      staff_id: data.airline_staff_id,
      must_change_password: true,
    });
    if (credsError) throw new ApiError(500, credsError.message);

    return {
      staff: {
        id: String(data.airline_staff_id),
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        username,
        role: input.role,
        airline: input.airline,
      },
      credentials: { username, password },
    };
  }

  if (input.role === 'gate-staff') {
    const { data, error } = await supabase
      .from('gate_staff')
      .insert({
        first_name: input.firstName,
        last_name: input.lastName,
        email: input.email,
        phone: input.phone,
        airline_code: input.airline,
        username,
      })
      .select('gate_staff_id')
      .single();

    if (error || !data) throw new ApiError(500, error?.message || 'Failed to create gate staff');

    const { error: credsError } = await supabase.from('staff_credentials').insert({
      username,
      password_hash: passwordHash,
      staff_role: 'gate-staff',
      staff_id: data.gate_staff_id,
      must_change_password: true,
    });
    if (credsError) throw new ApiError(500, credsError.message);

    return {
      staff: {
        id: String(data.gate_staff_id),
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        username,
        role: input.role,
        airline: input.airline,
      },
      credentials: { username, password },
    };
  }

  const { data, error } = await supabase
    .from('ground_staff')
    .insert({
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      phone: input.phone,
      username,
    })
    .select('ground_staff_id')
    .single();

  if (error || !data) throw new ApiError(500, error?.message || 'Failed to create ground staff');

  const { error: credsError } = await supabase.from('staff_credentials').insert({
    username,
    password_hash: passwordHash,
    staff_role: 'ground-staff',
    staff_id: data.ground_staff_id,
    must_change_password: true,
  });
  if (credsError) throw new ApiError(500, credsError.message);

  return {
    staff: {
      id: String(data.ground_staff_id),
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      username,
      role: input.role,
    },
    credentials: { username, password },
  };
}

export async function deleteStaff(role: StaffDTO['role'], id: string): Promise<void> {
  if (role === 'airline-staff') {
    const { data: staff, error: getError } = await supabase
      .from('airline_staff')
      .select('username')
      .eq('airline_staff_id', Number(id))
      .maybeSingle();
    if (getError) throw new ApiError(500, getError.message);
    if (staff?.username) {
      await supabase.from('staff_credentials').delete().eq('username', staff.username);
    }
    const { error } = await supabase.from('airline_staff').delete().eq('airline_staff_id', Number(id));
    if (error) throw new ApiError(500, error.message);
    return;
  }

  if (role === 'gate-staff') {
    const { data: staff, error: getError } = await supabase
      .from('gate_staff')
      .select('username')
      .eq('gate_staff_id', Number(id))
      .maybeSingle();
    if (getError) throw new ApiError(500, getError.message);
    if (staff?.username) {
      await supabase.from('staff_credentials').delete().eq('username', staff.username);
    }
    const { error } = await supabase.from('gate_staff').delete().eq('gate_staff_id', Number(id));
    if (error) throw new ApiError(500, error.message);
    return;
  }

  const { data: staff, error: getError } = await supabase
    .from('ground_staff')
    .select('username')
    .eq('ground_staff_id', Number(id))
    .maybeSingle();
  if (getError) throw new ApiError(500, getError.message);
  if (staff?.username) {
    await supabase.from('staff_credentials').delete().eq('username', staff.username);
  }
  const { error } = await supabase.from('ground_staff').delete().eq('ground_staff_id', Number(id));
  if (error) throw new ApiError(500, error.message);
}
