// src/handlers/messageHandler.ts
import { Worker } from 'worker_threads';
import path from 'path';
import { formatDateForSupabase } from '../functions';
import { GROUP_WHITELIST } from '../group-whitelist';
import { parseRitasiReport } from '../parsers/groupSupplyParser';

export async function handleMessage(message: string, timestamp: number, groupId: string | null) {
  if (groupId === GROUP_WHITELIST.SUPPLY || groupId === GROUP_WHITELIST.TEST) {
    const lines = message.split('\n');
    const header = lines[0];
    const reportDate = formatDateForSupabase(header);

    if (!reportDate) {
      console.log('⚠️ Gagal ambil tanggal dari judul laporan.');
      return;
    }

    console.log('📨 Pesan ritasi baru dari grup supply');
    const entries = parseRitasiReport(message);
    if (entries.length === 0) {
      console.log('⛔ No valid ritasi data found in message.');
      return;
    }

    // 🔁 Jalankan insert di background
    const worker = new Worker(path.resolve(__dirname, '../workers/insertRitasiWorker.js'), {
      workerData: { entries, reportDate },
    });

    worker.on('message', (msg) => {
      if (msg.success) {
        console.log('✅ Worker berhasil insert ritasi');
      } else {
        console.error('❌ Worker gagal insert:', msg.error);
      }
    });

    worker.on('error', (err) => {
      console.error('❌ Worker thread error:', err);
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        console.error(`⚠️ Worker stopped with exit code ${code}`);
      }
    });
  }
}
