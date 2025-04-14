// src/supabase.ts
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { RitasiEntry } from './parsers/groupSupplyParser';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE!;
const supabase = createClient(supabaseUrl, supabaseKey);

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
