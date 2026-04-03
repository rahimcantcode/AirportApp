import { supabase } from '../lib/supabase.js';
import { ApiError } from '../utils/errors.js';
import type { AirlineDTO } from '../types.js';

export async function listAirlines(): Promise<AirlineDTO[]> {
  const { data, error } = await supabase
    .from('airline')
    .select('airline_code, airline_name')
    .order('airline_code');

  if (error) throw new ApiError(500, error.message);

  return (data || []).map((a) => ({
    airlineCode: a.airline_code,
    airlineName: a.airline_name,
  }));
}

export async function assertAirlineExists(airlineCode: string): Promise<void> {
  const code = (airlineCode || '').toUpperCase();
  if (code.length !== 2) throw new ApiError(400, 'Airline code must be 2 characters');

  const { data, error } = await supabase
    .from('airline')
    .select('airline_code')
    .eq('airline_code', code)
    .maybeSingle();

  if (error) throw new ApiError(500, error.message);
  if (!data) throw new ApiError(400, `Unknown airline code: ${code}`);
}
