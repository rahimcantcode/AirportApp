import { supabase } from '../lib/supabase.js';
import { ApiError } from '../utils/errors.js';
import type { GateDTO } from '../types.js';

export async function listGates(): Promise<GateDTO[]> {
  const { data, error } = await supabase
    .from('gate')
    .select('gate_id, terminal, gate_number')
    .order('terminal')
    .order('gate_number');

  if (error) throw new ApiError(500, error.message);

  return (data || []).map((g) => ({
    id: g.gate_id,
    terminal: g.terminal,
    gateNumber: g.gate_number,
    gate: `${g.terminal}-${g.gate_number}`,
  }));
}

export async function getGateIdByLabel(gateLabel: string): Promise<number> {
  const gate = gateLabel.trim().toUpperCase();
  const [terminal, gateNumber] = gate.includes('-') ? gate.split('-', 2) : ['T1', gate];

  const { data, error } = await supabase
    .from('gate')
    .select('gate_id')
    .eq('terminal', terminal)
    .eq('gate_number', gateNumber)
    .maybeSingle();

  if (error) throw new ApiError(500, error.message);
  if (!data) throw new ApiError(400, `Unknown gate: ${terminal}-${gateNumber}`);

  return data.gate_id;
}

export async function getGateByLabel(gateLabel: string): Promise<GateDTO | null> {
  const gate = gateLabel.trim().toUpperCase();
  const [terminal, gateNumber] = gate.includes('-') ? gate.split('-', 2) : ['T1', gate];

  const { data, error } = await supabase
    .from('gate')
    .select('gate_id, terminal, gate_number')
    .eq('terminal', terminal)
    .eq('gate_number', gateNumber)
    .maybeSingle();

  if (error) throw new ApiError(500, error.message);
  if (!data) return null;
  return {
    id: data.gate_id,
    terminal: data.terminal,
    gateNumber: data.gate_number,
    gate: `${data.terminal}-${data.gate_number}`,
  };
}
