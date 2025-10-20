import { supabase } from "../../supabaseClient";


export async function fetchDailyCheckUnits() {
  const { data, error } = await supabase
    .from('storage')
    .select('unit_id, filter_config, daily_check_days')
    .not('daily_check_days', 'is', null)
    .order('daily_check_days', { ascending: true });

  if (error) throw error;
  return data;
}
