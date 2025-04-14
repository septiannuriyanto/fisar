// src/supabase.ts
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { RitasiEntry } from './parsers/groupSupplyParser';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE!;
const supabase = createClient(supabaseUrl, supabaseKey);


async function retryAsync<T>(
  fn: () => Promise<T>,
  maxRetries = 10,
  delayMs = 1000
): Promise<T> {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔁 Attempt ${attempt}...`);
      return await fn(); // kalau berhasil, langsung return
    } catch (err) {
      lastError = err;
      if (err instanceof Error) {
        console.warn(`⚠️ Attempt ${attempt} failed:`, err.message);
      } else {
        console.warn(`⚠️ Attempt ${attempt} failed with an unknown error.`);
      }
      if (attempt < maxRetries) await new Promise(res => setTimeout(res, delayMs));
    }
  }

  console.error(`❌ All ${maxRetries} attempts failed.`);
  throw lastError;
}

export async function insertRitasiWithRetry(entries: RitasiEntry[], reportDate: string) {
  return retryAsync(() => insertRitasi(entries, reportDate), 10, 3000); // 10x, 1.5s jeda
}



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
  return data;
}
