// src/handlers/messageHandler.ts

import { parseRitasiReport } from '../parser';
import { insertRitasi } from '../supabase';

const formatDateForSupabase = (input: string): string | null => {
  const match = input.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) return null;

  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
};

export async function handleMessage(message: string, timestamp: number) {
  const lines = message.split('\n');
  const header = lines[0]; // Ambil baris pertama
  const reportDate = formatDateForSupabase(header);

  if (!reportDate) {
    console.log('⚠️ Gagal ambil tanggal dari judul laporan.');
    return;
  }

  const entries = parseRitasiReport(message);
  if (entries.length === 0) {
    console.log('⛔ No valid ritasi data found in message.');
    return;
  }

  console.log('📦 Parsed entries:', entries);
  await insertRitasi(entries, reportDate);
}
