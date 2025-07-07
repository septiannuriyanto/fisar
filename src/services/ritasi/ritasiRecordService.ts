
import { RitasiEntry } from "../../parsers/groupSupplerParser/groupSupplyParser";
import { supabase } from "../../supabaseClient";
import { retryAsync } from "../retryAsync";

//============================================================================================PROCEDURE INSERT RITASI
export async function insertRitasi(entries: RitasiEntry[], reportDate: string) {
  // Convert 'YYYY-MM-DD' ke 'YYMMDD'
  const dateObj = new Date(reportDate);
  const yy = String(dateObj.getFullYear()).slice(2);
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const formattedDate = `${yy}${mm}${dd}`;

  // Siapkan payload yang akan dimasukkan
  const payload = entries.map(entry => ({
    do_number: `G${formattedDate}${entry.shift}${entry.noDo}`,
    unit_id: entry.unit,
    qty: entry.volume,
    report_date: reportDate,
    shift: entry.shift,
  }));

  // Log ke console sebelum insert
  console.log('📝 Payload yang akan di-insert ke Database:', JSON.stringify(payload, null, 2));

  const { data, error } = await supabase
    .from('ritasi_daily_reconcile')
    .insert(payload);

  if (error) {
    console.error('❌ Failed to insert data:', error);
    throw error;
  }

  console.log('✅ Data inserted:', data);
}






export async function insertRitasiWithRetry(entries: RitasiEntry[], reportDate: string) {
  return retryAsync(() => insertRitasi(entries, reportDate), 10, 3000); // 10x, 1.5s jeda

}


