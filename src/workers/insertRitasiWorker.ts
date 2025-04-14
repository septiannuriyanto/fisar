// src/workers/insertWorker.ts
import { parentPort, workerData } from 'worker_threads';
import { insertRitasiWithRetry } from '../supabase';

(async () => {
  try {
    const { entries, reportDate } = workerData;
    const result = await insertRitasiWithRetry(entries, reportDate);
    parentPort?.postMessage({ success: true, data: result });
  } catch (error: any) {
    parentPort?.postMessage({ success: false, error: error.message });
  }
})();
