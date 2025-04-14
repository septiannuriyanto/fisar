// src/handlers/messageHandler.ts

import { formatDateForSupabase } from '../functions';
import { GROUP_WHITELIST } from '../group-whitelist';
import { parseRitasiReport } from '../parsers/groupSupplyParser';
import { insertRitasi } from '../supabase';



export async function handleMessage(message: string, timestamp: number, groupId:string| null) {
  console.log(groupId===GROUP_WHITELIST.SUPPLY);
  
  //Filter by group Id
  if(groupId===GROUP_WHITELIST.SUPPLY || groupId===GROUP_WHITELIST.TEST){
    const lines = message.split('\n');
    const header = lines[0]; // Ambil baris pertama
    const reportDate = formatDateForSupabase(header);
  
    if (!reportDate) {
      console.log('⚠️ Gagal ambil tanggal dari judul laporan.');
      return;
    }
    console.log('Pesan ritasi baru dari grup supply:');
    const entries = parseRitasiReport(message);
    if (entries.length === 0) {
      console.log('⛔ No valid ritasi data found in message.');
      return;
    }
    console.log('📦 Parsed entries:', entries);
    await insertRitasi(entries, reportDate);

  }


}
