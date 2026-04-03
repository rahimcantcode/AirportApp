import { supabase } from '../lib/supabase.js';
import { ApiError } from '../utils/errors.js';

export async function listGroundStaffBagAccess() {
  const { data, error } = await supabase
    .from('ground_staff_bag_access')
    .select('ground_staff_id, bag_id, granted_at')
    .order('ground_staff_id')
    .order('bag_id');

  if (error) throw new ApiError(500, error.message);
  return data || [];
}

export async function grantGroundStaffBagAccess(groundStaffId: number, bagId: string) {
  const { error } = await supabase
    .from('ground_staff_bag_access')
    .upsert({ ground_staff_id: groundStaffId, bag_id: bagId }, { onConflict: 'ground_staff_id,bag_id' });

  if (error) throw new ApiError(500, error.message);
}

export async function revokeGroundStaffBagAccess(groundStaffId: number, bagId: string) {
  const { error } = await supabase
    .from('ground_staff_bag_access')
    .delete()
    .eq('ground_staff_id', groundStaffId)
    .eq('bag_id', bagId);

  if (error) throw new ApiError(500, error.message);
}
