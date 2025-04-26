import { headerMsg, signatureMsg } from "../../class/constants";
import { getSockInstance } from "../../class/whatsapp-socket";
import { GROUP_LIST } from "../../group-whitelist";
import { RitasiEntry } from "../../parsers/groupSupplerParser/groupSupplyParser";
import { supabase } from "../../supabaseClient";
import { retryAsync } from "../retryAsync";
import { checkUnrecordedSuratJalan } from "./checkDifferenceRitasi";

//============================================================================================PROCEDURE INSERT RITASI
export async function insertRitasi(entries: RitasiEntry[], reportDate: string) {
  const { data, error } = await supabase
    .from('ritasi_daily_reconcile') // Ganti sesuai nama tabel kamu
    .insert(
      entries.map(entry => ({
        do_number : entry.noDo,
        unit_id: entry.unit,
        qty: entry.volume,
        report_date: reportDate,
      }))
    );

  if (error) {
    console.error('❌ Failed to insert data:', error);
    throw error;
  }

  console.log('✅ Data inserted:');
   
}


export async function insertRitasiWithRetry(entries: RitasiEntry[], reportDate: string) {
  return retryAsync(() => insertRitasi(entries, reportDate), 10, 3000); // 10x, 1.5s jeda
}