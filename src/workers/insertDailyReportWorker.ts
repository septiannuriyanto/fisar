// src/workers/insertFilterChangeWorker.ts
import { parentPort, workerData } from 'worker_threads';
import { insertFuelmanDailyReportWithRetry } from '../services/dailyReport/dailyReportServices';

(async () => {
  try {
    const { entry } = workerData;
    const result = await insertFuelmanDailyReportWithRetry(entry);
    parentPort?.postMessage({ success: true, data: result });
  } catch (error: any) {
    parentPort?.postMessage({ success: false, error: error.message });
  }
})();
