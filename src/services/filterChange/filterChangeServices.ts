import { supabase } from "../../supabaseClient";
import { retryAsync } from "../retryAsync";

//============================================================================================PROCEDURE INSERT FILTER CHANGE
function generateIdFromEntry(entry: any): string {
  const yymmdd = new Date(entry.tanggal).toISOString().slice(2, 10).replace(/-/g, '');
  return `${yymmdd}${entry.unit_id}`;
}

export async function insertFilterChange(entry: any) {
  const { data: fuelPassData, error: rpcError } = await supabase
    .rpc('get_last_flowmeter', {
      unit_id_input: entry.unit_id,
      current_flowmeter: entry.flowmeter,
    });

  if (rpcError) {
    console.error('❌ Failed to call RPC:', rpcError);
    throw rpcError;
  }

  const fuel_pass = fuelPassData ?? 0;
  const id = generateIdFromEntry(entry); // e.g. yymmdd + unit_id

  const { data, error } = await supabase
    .from('filter_change')
    .insert([
      {
        id,
        tanggal: entry.tanggal,
        unit_id: entry.unit_id,
        flowmeter: entry.flowmeter,
        qty: entry.qty,
        fuelman: entry.fuelman,
        operator: entry.operator,
        fuel_pass, // 🆕 inserted here
      },
    ]);

  if (error) {
    console.error('❌ Failed to insert data:', error);
    throw error;
  }

  console.log('✅ Data inserted with fuel_pass =', fuel_pass);
  return data;
}

export async function insertFilterChangeWithRetry(entry: any) {
  return retryAsync(() => insertFilterChange(entry), 10, 3000); // 10x, 1.5s jeda
}
