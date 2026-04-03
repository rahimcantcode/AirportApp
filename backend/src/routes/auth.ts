import { Router } from 'express';
import { supabase } from '../lib/supabase.js';
import { ApiError } from '../utils/errors.js';
import { compare, hash } from 'bcryptjs';
import { assertStrongPassword } from '../utils/validation.js';

export const authRouter = Router();

async function passwordMatches(input: string, stored: string): Promise<boolean> {
  if (!stored) return false;
  if (stored.startsWith('$2a$') || stored.startsWith('$2b$') || stored.startsWith('$2y$')) {
    return compare(input, stored);
  }
  return input === stored;
}

authRouter.post('/staff-login', async (req, res, next) => {
  try {
    const username = String(req.body?.username || '').trim();
    const password = String(req.body?.password || '').trim();

    if (!username || !password) throw new ApiError(400, 'username and password are required');

    const { data: adminCred, error: adminErr } = await supabase
      .from('login_credentials')
      .select('admin_id, username, password_hash, must_change_password')
      .eq('username', username)
      .maybeSingle();

    if (adminErr) throw new ApiError(500, adminErr.message);
    if (adminCred && adminCred.admin_id !== null && (await passwordMatches(password, adminCred.password_hash))) {
      return res.json({
        id: String(adminCred.admin_id),
        username: adminCred.username,
        role: 'admin',
        mustChangePassword: Boolean(adminCred.must_change_password),
      });
    }

    const { data: creds, error } = await supabase
      .from('staff_credentials')
      .select('username, password_hash, staff_role, staff_id, must_change_password')
      .eq('username', username)
      .maybeSingle();

    if (error) throw new ApiError(500, error.message);
    if (!creds || !(await passwordMatches(password, creds.password_hash))) {
      throw new ApiError(401, 'Invalid credentials');
    }

    if (creds.staff_role === 'airline-staff') {
      const { data: staff, error: sError } = await supabase
        .from('airline_staff')
        .select('airline_staff_id, airline_code, username')
        .eq('airline_staff_id', creds.staff_id)
        .single();
      if (sError) throw new ApiError(500, sError.message);
      return res.json({
        id: String(staff.airline_staff_id),
        username: staff.username,
        role: 'airline-staff',
        airline: staff.airline_code,
        mustChangePassword: Boolean(creds.must_change_password),
      });
    }

    if (creds.staff_role === 'gate-staff') {
      const { data: staff, error: sError } = await supabase
        .from('gate_staff')
        .select('gate_staff_id, airline_code, username')
        .eq('gate_staff_id', creds.staff_id)
        .single();
      if (sError) throw new ApiError(500, sError.message);
      return res.json({
        id: String(staff.gate_staff_id),
        username: staff.username,
        role: 'gate-staff',
        airline: staff.airline_code,
        mustChangePassword: Boolean(creds.must_change_password),
      });
    }

    const { data: staff, error: sError } = await supabase
      .from('ground_staff')
      .select('ground_staff_id, username')
      .eq('ground_staff_id', creds.staff_id)
      .single();
    if (sError) throw new ApiError(500, sError.message);
    return res.json({
      id: String(staff.ground_staff_id),
      username: staff.username,
      role: 'ground-staff',
      mustChangePassword: Boolean(creds.must_change_password),
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/passenger-login', async (req, res, next) => {
  try {
    const identificationNumber = String(req.body?.identificationNumber || '').trim();
    const ticketNumber = String(req.body?.ticketNumber || '').trim();

    if (!identificationNumber || !ticketNumber) {
      throw new ApiError(400, 'identificationNumber and ticketNumber are required');
    }

    const { data, error } = await supabase
      .from('passenger')
      .select('ticket_number, first_name, last_name')
      .eq('ticket_number', ticketNumber)
      .eq('identification', identificationNumber)
      .maybeSingle();

    if (error) throw new ApiError(500, error.message);
    if (!data) throw new ApiError(401, 'Invalid passenger credentials');

    res.json({
      id: data.ticket_number,
      username: `${data.first_name} ${data.last_name}`.trim(),
      role: 'passenger',
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/change-password', async (req, res, next) => {
  try {
    const username = String(req.body?.username || '').trim();
    const currentPassword = String(req.body?.currentPassword || '').trim();
    const newPassword = String(req.body?.newPassword || '').trim();

    if (!username || !currentPassword || !newPassword) {
      throw new ApiError(400, 'username, currentPassword, and newPassword are required');
    }

    assertStrongPassword(newPassword);

    const { data: adminCred, error: adminErr } = await supabase
      .from('login_credentials')
      .select('username, password_hash')
      .eq('username', username)
      .maybeSingle();
    if (adminErr) throw new ApiError(500, adminErr.message);

    if (adminCred) {
      if (!(await passwordMatches(currentPassword, adminCred.password_hash))) {
        throw new ApiError(401, 'Invalid current password');
      }

      const password_hash = await hash(newPassword, 10);
      const { error: updateErr } = await supabase
        .from('login_credentials')
        .update({ password_hash, must_change_password: false })
        .eq('username', username);
      if (updateErr) throw new ApiError(500, updateErr.message);
      return res.json({ ok: true });
    }

    const { data: staffCred, error: staffErr } = await supabase
      .from('staff_credentials')
      .select('username, password_hash')
      .eq('username', username)
      .maybeSingle();
    if (staffErr) throw new ApiError(500, staffErr.message);
    if (!staffCred) throw new ApiError(404, 'User not found');

    if (!(await passwordMatches(currentPassword, staffCred.password_hash))) {
      throw new ApiError(401, 'Invalid current password');
    }

    const password_hash = await hash(newPassword, 10);
    const { error: updateErr } = await supabase
      .from('staff_credentials')
      .update({ password_hash, must_change_password: false })
      .eq('username', username);
    if (updateErr) throw new ApiError(500, updateErr.message);

    return res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});
