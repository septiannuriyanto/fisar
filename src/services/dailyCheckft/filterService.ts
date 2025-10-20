import { supabase } from "../../supabaseClient";

export async function fetchFilterSetup(configId: string) {
  const { data, error } = await supabase
    .from('filter_setup')
    .select('filter_material_code, qty, replacement_interval_hours, replacement_interval_days')
    .eq('id', configId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function fetchLastFilterChange(unitId: string) {
  const { data, error } = await supabase
    .from('filter_change')
    .select('tanggal')
    .eq('unit_id', unitId)
    .order('tanggal', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}
